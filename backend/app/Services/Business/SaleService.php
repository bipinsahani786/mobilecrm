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

        return $query->paginate($perPage);
    }

    public function createSale(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Generate Invoice Number
            $invoiceNumber = 'INV-' . strtoupper(Str::random(8)) . '-' . time();

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
                'business_id' => auth()->user()->business_id,
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
                'status' => 'completed',
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
                ]);

                // Deduct stock if batch is provided
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

            // 1. Revert Old Items & Inventory
            foreach ($sale->items as $item) {
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

            // Delete old related records
            $sale->items()->delete();
            $sale->payments()->delete();
            Sale::where('notes', 'like', "%(Invoice: {$sale->invoice_number})%")->delete();
            if ($sale->emiDetail) {
                $sale->emiDetail->installments()->delete();
                $sale->emiDetail()->delete();
            }

            // 2. Apply New Data
            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += ($item['quantity'] * $item['unit_price']);
            }

            $discount = $data['discount'] ?? 0;
            $roundOff = $data['round_off'] ?? 0;
            $finalAmount = $totalAmount - $discount + $roundOff;

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
            ]);

            // 3. Create New Items & Deduct Stock
            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];

                $saleItem = $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'product_batch_id' => $item['product_batch_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);

                if (!empty($item['product_batch_id'])) {
                    $batch = ProductBatch::find($item['product_batch_id']);
                    if ($batch) {
                        $batch->decrement('remaining_quantity', $item['quantity']);
                        $batch->product->decrement('quantity', $item['quantity']);

                        InventoryMovement::create([
                            'product_id' => $batch->product_id,
                            'type' => 'out',
                            'quantity' => $item['quantity'],
                            'reference_type' => 'sale',
                            'reference_id' => $sale->id,
                        ]);
                    }
                } else {
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

            return $sale->load(['customer', 'items.product', 'payments', 'emiDetail']);
        });
    }
}
