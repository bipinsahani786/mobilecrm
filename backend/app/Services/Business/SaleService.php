<?php

namespace App\Services\Business;

use App\Models\Sale;
use App\Models\ProductBatch;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaleService
{
    public function getSales($perPage = 15, $search = null, $paymentMode = null, $startDate = null, $endDate = null, $hasUdhar = null)
    {
        $query = Sale::with(['customer', 'user', 'items.product', 'payments', 'emiDetail'])
            ->where('invoice_number', 'not like', 'UDH-%')
            ->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($paymentMode) {
            $query->where('payment_mode', $paymentMode);
        }

        if ($startDate) {
            $query->whereDate('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('date', '<=', $endDate);
        }

        if ($hasUdhar === 'yes') {
            $query->whereHas('payments', function ($pq) {
                $pq->where('payment_mode', 'Udhar');
            });
        } elseif ($hasUdhar === 'no') {
            $query->whereDoesntHave('payments', function ($pq) {
                $pq->where('payment_mode', 'Udhar');
            });
        }

        $aggregatesQuery = clone $query;
        
        $totalRevenue = (clone $aggregatesQuery)->sum('final_amount');
        
        // Sum of all Udhar payments for these sales
        $totalUdhar = \App\Models\SalePayment::whereIn('sale_id', (clone $aggregatesQuery)->select('id'))
            ->where('payment_mode', 'Udhar')
            ->sum('amount');

        return [
            'paginator' => $query->paginate($perPage),
            'aggregates' => [
                'total_revenue' => $totalRevenue,
                'total_udhar' => $totalUdhar,
            ]
        ];
    }

    public function createSale(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Generate Invoice Number
            $businessId = app('current_business_id') ?? (auth()->check() ? (auth()->user()->business_id ?? auth()->user()->businesses()->first()?->id) : null);
            $business = \App\Models\Business::find($businessId);
            $pattern = $business->settings['sale_invoice_prefix'] ?? 'INV-{SEQ:4}';
            
            // Replace date placeholders
            $date = now();
            $pattern = str_replace('{YYYY}', $date->format('Y'), $pattern);
            $pattern = str_replace('{YY}', $date->format('y'), $pattern);
            $pattern = str_replace('{MM}', $date->format('m'), $pattern);
            
            // Find {SEQ:n}
            $seqLength = 4;
            if (preg_match('/\{SEQ:(\d+)\}/', $pattern, $matches)) {
                $seqLength = (int) $matches[1];
                $pattern = str_replace($matches[0], '{SEQ}', $pattern);
            } else {
                if (!str_contains($pattern, '{SEQ}')) {
                    $pattern .= '{SEQ}';
                }
            }
            
            $parts = explode('{SEQ}', $pattern);
            $prefix = $parts[0];
            $suffix = $parts[1] ?? '';
            
            $lastSale = Sale::where('business_id', $businessId)
                ->where('invoice_number', 'like', $prefix . '%' . $suffix)
                ->where('invoice_number', 'not like', 'UDH-%')
                ->orderBy('id', 'desc')
                ->first();
                
            $nextNumber = 1;
            if ($lastSale) {
                $invNum = $lastSale->invoice_number;
                // Extract the sequence between prefix and suffix
                $seqStr = substr($invNum, strlen($prefix));
                if ($suffix !== '') {
                    $seqStr = substr($seqStr, 0, -strlen($suffix));
                }
                if (is_numeric($seqStr)) {
                    $nextNumber = (int) $seqStr + 1;
                } else {
                    preg_match('/(\d+)/', $seqStr, $m);
                    if (!empty($m)) {
                        $nextNumber = (int) $m[1] + 1;
                    }
                }
            }
            $invoiceNumber = $prefix . str_pad($nextNumber, $seqLength, '0', STR_PAD_LEFT) . $suffix;

            // Calculate totals
            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += ($item['quantity'] * $item['unit_price']);
            }

            $discount = $data['discount'] ?? 0;
            $roundOff = $data['round_off'] ?? 0;
            $finalAmount = $totalAmount - $discount + $roundOff;
            
            // Calculate total paid from split payments or EMI down payment
            $paidAmount = 0;
            if (!empty($data['payments'])) {
                foreach ($data['payments'] as $payment) {
                    $paidAmount += $payment['amount'];
                }
            }

            // Create Sale
            $sale = Sale::create([
                'business_id' => $businessId,
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => auth()->id(),
                'invoice_number' => $invoiceNumber,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'round_off' => $roundOff,
                'final_amount' => $finalAmount,
                'paid_amount' => $paidAmount,
                'payment_mode' => $data['payment_mode'] ?? null, // legacy/primary
                'date' => $data['date'] ?? now()->toDateString(),
                'notes' => $data['notes'] ?? null,
                'status' => $data['status'] ?? 'completed',
                'draft_data' => ($data['status'] ?? 'completed') === 'Draft' ? $data : null,
            ]);

            // Create Items & Deduct Stock
            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];

                $saleItem = $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'product_batch_id' => $item['product_batch_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                    'imei_1' => $item['imei_1'] ?? null,
                    'imei_2' => $item['imei_2'] ?? null,
                    'serial_no' => $item['serial_no'] ?? null,
                ]);

                // Deduct stock if batch is provided
                if (($data['status'] ?? 'completed') !== 'Draft') {
                    if (!empty($item['product_batch_id'])) {
                        $batch = ProductBatch::find($item['product_batch_id']);
                        if ($batch) {
                            $batch->decrement('remaining_quantity', $item['quantity']);
                            
                            // Also decrement main product quantity
                            $product = $batch->product;
                            $product->decrement('quantity', $item['quantity']);
    
                            // Log movement
                            InventoryMovement::create([
                                'product_id' => $product->id,
                                'type' => 'out',
                                'quantity' => $item['quantity'],
                                'reference_type' => 'sale',
                                'reference_id' => $sale->id,
                            ]);
                        }
                    } else {
                        // Fallback to decrementing main product quantity only
                        $product = \App\Models\Product::find($item['product_id']);
                        if ($product) {
                            $product->decrement('quantity', $item['quantity']);
                            InventoryMovement::create([
                                'product_id' => $product->id,
                                'type' => 'out',
                                'quantity' => $item['quantity'],
                                'reference_type' => 'sale',
                                'reference_id' => $sale->id,
                            ]);
                        }
                    }
                }
            }

            if (($data['status'] ?? 'completed') !== 'Draft') {
                // Create Split Payments
                if (!empty($data['payments'])) {
                    foreach ($data['payments'] as $payment) {
                        $notes = $payment['notes'] ?? null;
                        
                        if (!empty($payment['link_customer_id']) && strtolower($payment['payment_mode']) === 'udhar') {
                            $linkCustomerId = $payment['link_customer_id'];
                            $linkCust = \App\Models\Customer::find($linkCustomerId);
                            $linkCustName = $linkCust ? $linkCust->name : 'Unknown';
                            
                            $notes = ($notes ? $notes . ' | ' : '') . "Udhar linked to Customer: {$linkCustName} (ID: {$linkCustomerId})";
                            
                            Sale::create([
                                'business_id' => $sale->business_id,
                                'customer_id' => $linkCustomerId,
                                'user_id' => $sale->user_id,
                                'invoice_number' => 'UDH-' . strtoupper(Str::random(6)) . '-' . time(),
                                'total_amount' => $payment['amount'],
                                'discount' => 0,
                                'round_off' => 0,
                                'final_amount' => $payment['amount'],
                                'paid_amount' => 0,
                                'payment_mode' => 'Udhar',
                                'date' => $sale->date,
                                'notes' => "Downpayment Credit (Udhar) for " . ($sale->customer->name ?? 'Walk-in Customer') . "'s purchase (Invoice: {$sale->invoice_number}, ID: {$sale->id})",
                                'status' => 'completed',
                            ]);
                        }
    
                        $sale->payments()->create([
                            'payment_mode' => $payment['payment_mode'],
                            'amount' => $payment['amount'],
                            'notes' => $notes,
                        ]);
                    }
                }
    
                // Create EMI Detail
                if (!empty($data['emi_detail'])) {
                    $emiDetail = $sale->emiDetail()->create([
                        'financier_name' => $data['emi_detail']['financier_name'],
                        'down_payment' => $data['emi_detail']['down_payment'] ?? 0,
                        'loan_amount' => $data['emi_detail']['loan_amount'],
                        'processing_fee' => $data['emi_detail']['processing_fee'] ?? 0,
                        'tenure_months' => $data['emi_detail']['tenure_months'] ?? null,
                        'monthly_installment_amount' => $data['emi_detail']['monthly_installment_amount'] ?? null,
                        'first_emi_date' => $data['emi_detail']['first_emi_date'] ?? null,
                    ]);
    
                    if ($emiDetail->tenure_months > 0 && $emiDetail->monthly_installment_amount > 0) {
                        $firstDate = $emiDetail->first_emi_date ? \Carbon\Carbon::parse($emiDetail->first_emi_date) : now()->addMonth();
                        
                        for ($i = 1; $i <= $emiDetail->tenure_months; $i++) {
                            $emiDetail->installments()->create([
                                'installment_number' => $i,
                                'amount' => $emiDetail->monthly_installment_amount,
                                'due_date' => $firstDate->copy()->addMonths($i - 1)->format('Y-m-d'),
                            ]);
                        }
                    }
                }
    
                // Auto-calculate Commission for Staff
                $staffPivot = \Illuminate\Support\Facades\DB::table('business_user')
                    ->where('business_id', $sale->business_id)
                    ->where('user_id', auth()->id())
                    ->first();
    
                if ($staffPivot && $staffPivot->commission_rate > 0) {
                    $commissionRate = (float) $staffPivot->commission_rate;
                    $commissionAmount = ($sale->final_amount * $commissionRate) / 100;
                    
                    \App\Models\SaleCommission::create([
                        'business_id' => $sale->business_id,
                        'user_id' => auth()->id(),
                        'sale_id' => $sale->id,
                        'sale_amount' => $sale->final_amount,
                        'commission_rate' => $commissionRate,
                        'commission_amount' => $commissionAmount,
                    ]);
                }
            }

            return $sale->load(['customer', 'items.product', 'payments', 'emiDetail']);
        });
    }

    public function updateSale(Sale $sale, array $data)
    {
        return DB::transaction(function () use ($sale, $data) {
            // Check if EMI installments have been paid
            if ($sale->emiDetail && $sale->emiDetail->installments()->where('status', 'paid')->exists()) {
                throw new \Exception("Cannot edit sale because some EMI installments have already been paid.");
            }

            $isDraftRevert = $sale->status === 'Draft';

            $hasItems = !empty($data['items']);

            // 1. Revert Old Items & Inventory (only if items are provided)
            if ($hasItems) {
                foreach ($sale->items as $item) {
                    if (!$isDraftRevert) {
                        if ($item->product_batch_id) {
                        $batch = ProductBatch::find($item->product_batch_id);
                        if ($batch) {
                            $batch->increment('remaining_quantity', $item->quantity);
                            $batch->product->increment('quantity', $item->quantity);
                            
                            InventoryMovement::create([
                                'product_id' => $batch->product_id,
                                'type' => 'in',
                                'quantity' => $item->quantity,
                                'reference_type' => 'sale_edit_revert',
                                'reference_id' => $sale->id,
                            ]);
                        }
                    } else {
                        $product = \App\Models\Product::find($item->product_id);
                        if ($product) {
                            $product->increment('quantity', $item->quantity);
                            InventoryMovement::create([
                                'product_id' => $product->id,
                                'type' => 'in',
                                'quantity' => $item->quantity,
                                'reference_type' => 'sale_edit_revert',
                                'reference_id' => $sale->id,
                            ]);
                        }
                        }
                    }
                }
                // Delete old items
                $sale->items()->delete();
            }

            // Delete old related records
            $sale->payments()->delete();
            Sale::where('notes', 'like', "%(Invoice: {$sale->invoice_number})%")->delete();
            if ($sale->emiDetail) {
                $sale->emiDetail->installments()->delete();
                $sale->emiDetail()->delete();
            }

            // 2. Apply New Data
            $totalAmount = $sale->total_amount;
            if ($hasItems) {
                $totalAmount = 0;
                foreach ($data['items'] as $item) {
                    $totalAmount += ($item['quantity'] * $item['unit_price']);
                }
            }

            $discount = $data['discount'] ?? $sale->discount;
            $roundOff = $data['round_off'] ?? $sale->round_off;
            
            if ($hasItems || isset($data['discount']) || isset($data['round_off'])) {
                $finalAmount = $totalAmount - $discount + $roundOff;
            } else {
                $finalAmount = $sale->final_amount;
            }

            $paidAmount = 0;
            if (!empty($data['payments'])) {
                foreach ($data['payments'] as $payment) {
                    $paidAmount += $payment['amount'];
                }
            }

            $sale->update([
                'customer_id' => $data['customer_id'] ?? null,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'round_off' => $roundOff,
                'final_amount' => $finalAmount,
                'paid_amount' => $paidAmount,
                'payment_mode' => $data['payment_mode'] ?? null,
                'date' => $data['date'] ?? $sale->date,
                'notes' => $data['notes'] ?? null,
                'status' => $data['status'] ?? 'completed',
                'draft_data' => ($data['status'] ?? 'completed') === 'Draft' ? $data : null,
            ]);

            // 3. Create New Items & Deduct Stock
            if ($hasItems) {
                foreach ($data['items'] as $item) {
                    $subtotal = $item['quantity'] * $item['unit_price'];

                    $saleItem = $sale->items()->create([
                        'product_id' => $item['product_id'],
                        'product_batch_id' => $item['product_batch_id'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $subtotal,
                        'imei_1' => $item['imei_1'] ?? null,
                        'imei_2' => $item['imei_2'] ?? null,
                        'serial_no' => $item['serial_no'] ?? null,
                    ]);

                    if (($data['status'] ?? 'completed') !== 'Draft') {
                        if (!empty($item['product_batch_id'])) {
                            $batch = ProductBatch::find($item['product_batch_id']);
                            if ($batch) {
                                $batch->decrement('remaining_quantity', $item['quantity']);
                                
                                $product = $batch->product;
                                $product->decrement('quantity', $item['quantity']);
        
                                InventoryMovement::create([
                                    'product_id' => $product->id,
                                    'type' => 'out',
                                    'quantity' => $item['quantity'],
                                    'reference_type' => 'sale_edit',
                                    'reference_id' => $sale->id,
                                ]);
                            }
                        } else {
                            $product = \App\Models\Product::find($item['product_id']);
                            if ($product) {
                                $product->decrement('quantity', $item->quantity);
                                InventoryMovement::create([
                                    'product_id' => $product->id,
                                    'type' => 'out',
                                    'quantity' => $item->quantity,
                                    'reference_type' => 'sale_edit',
                                    'reference_id' => $sale->id,
                                ]);
                            }
                        }
                    }
                }
            }

            if (($data['status'] ?? 'completed') !== 'Draft') {
                // 4. Create New Split Payments
                if (!empty($data['payments'])) {
                    foreach ($data['payments'] as $payment) {
                        $notes = $payment['notes'] ?? null;
                        
                        if (!empty($payment['link_customer_id']) && strtolower($payment['payment_mode']) === 'udhar') {
                            $linkCustomerId = $payment['link_customer_id'];
                            $linkCust = \App\Models\Customer::find($linkCustomerId);
                            $linkCustName = $linkCust ? $linkCust->name : 'Unknown';
                            
                            $notes = ($notes ? $notes . ' | ' : '') . "Udhar linked to Customer: {$linkCustName} (ID: {$linkCustomerId})";
                            
                            Sale::create([
                                'business_id' => $sale->business_id,
                                'customer_id' => $linkCustomerId,
                                'user_id' => $sale->user_id,
                                'invoice_number' => 'UDH-' . strtoupper(Str::random(6)) . '-' . time(),
                                'total_amount' => $payment['amount'],
                                'discount' => 0,
                                'round_off' => 0,
                                'final_amount' => $payment['amount'],
                                'paid_amount' => 0,
                                'payment_mode' => 'Udhar',
                                'date' => $sale->date,
                                'notes' => "Downpayment Credit (Udhar) for " . ($sale->customer->name ?? 'Walk-in Customer') . "'s purchase (Invoice: {$sale->invoice_number}, ID: {$sale->id})",
                                'status' => 'completed',
                            ]);
                        }
    
                        $sale->payments()->create([
                            'payment_mode' => $payment['payment_mode'],
                            'amount' => $payment['amount'],
                            'notes' => $notes,
                        ]);
                    }
                }
    
                // 5. Create New EMI Detail
                if (!empty($data['emi_detail'])) {
                    $emiDetail = $sale->emiDetail()->create([
                        'financier_name' => $data['emi_detail']['financier_name'],
                        'down_payment' => $data['emi_detail']['down_payment'] ?? 0,
                        'loan_amount' => $data['emi_detail']['loan_amount'],
                        'processing_fee' => $data['emi_detail']['processing_fee'] ?? 0,
                        'tenure_months' => $data['emi_detail']['tenure_months'] ?? null,
                        'monthly_installment_amount' => $data['emi_detail']['monthly_installment_amount'] ?? null,
                        'first_emi_date' => $data['emi_detail']['first_emi_date'] ?? null,
                    ]);
    
                    if ($emiDetail->tenure_months > 0 && $emiDetail->monthly_installment_amount > 0) {
                        $firstDate = $emiDetail->first_emi_date ? \Carbon\Carbon::parse($emiDetail->first_emi_date) : now()->addMonth();
                        
                        for ($i = 1; $i <= $emiDetail->tenure_months; $i++) {
                            $emiDetail->installments()->create([
                                'installment_number' => $i,
                                'amount' => $emiDetail->monthly_installment_amount,
                                'due_date' => $firstDate->copy()->addMonths($i - 1)->format('Y-m-d'),
                            ]);
                        }
                    }
                }
            }

            return $sale->load(['customer', 'items.product', 'payments', 'emiDetail']);
        });
    }
}
