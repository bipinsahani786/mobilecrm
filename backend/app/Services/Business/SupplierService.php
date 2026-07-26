<?php

namespace App\Services\Business;

use App\Models\Supplier;
use App\Models\SupplierPurchase;
use App\Models\SupplierPayment;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnItem;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    public function getSuppliers($perPage = 15)
    {
        return Supplier::withSum('purchases', 'bill_amount')
            ->withSum('purchases', 'paid_amount')
            ->withSum(['payments as general_payments_sum' => function ($query) {
                $query->whereNull('supplier_purchase_id');
            }], 'amount')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function createSupplier(array $data)
    {
        return Supplier::create($data);
    }

    public function updateSupplier(Supplier $supplier, array $data)
    {
        $supplier->update($data);
        return $supplier;
    }

    public function deleteSupplier(Supplier $supplier)
    {
        $supplier->delete();
    }

    public function recordPurchase(Supplier $supplier, array $data, $invoicePath = null)
    {
        return DB::transaction(function () use ($supplier, $data, $invoicePath) {
            $businessId = app('current_business_id') ?? (auth()->check() ? (auth()->user()->business_id ?? auth()->user()->businesses()->first()?->id) : null);
            $business = \App\Models\Business::find($businessId);
            $pattern = $business->settings['purchase_invoice_prefix'] ?? 'PUR-{SEQ:4}';
            
            $date = now();
            $pattern = str_replace('{YYYY}', $date->format('Y'), $pattern);
            $pattern = str_replace('{YY}', $date->format('y'), $pattern);
            $pattern = str_replace('{MM}', $date->format('m'), $pattern);
            
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
            
            $lastPurchase = SupplierPurchase::where('business_id', $businessId)
                ->where('purchase_number', 'like', $prefix . '%' . $suffix)
                ->orderBy('id', 'desc')
                ->first();
                
            $nextNumber = 1;
            if ($lastPurchase && $lastPurchase->purchase_number) {
                $purNum = $lastPurchase->purchase_number;
                $seqStr = substr($purNum, strlen($prefix));
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
            $purchaseNumber = $prefix . str_pad($nextNumber, $seqLength, '0', STR_PAD_LEFT) . $suffix;

            $purchase = $supplier->purchases()->create([
                'business_id' => $businessId,
                'purchase_number' => $purchaseNumber,
                'bill_amount' => $data['bill_amount'],
                'paid_amount' => $data['paid_amount'] ?? 0,
                'purchase_date' => $data['purchase_date'],
                'due_date' => $data['due_date'] ?? null,
                'invoice_file' => $invoicePath,
            ]);

            foreach ($data['items'] as $item) {
                $totalPrice = $item['quantity'] * $item['purchase_price'];
                
                $purchase->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'purchase_price' => $item['purchase_price'],
                    'total_price' => $totalPrice,
                ]);

                // Update inventory
                $product = Product::find($item['product_id']);
                $product->quantity += $item['quantity'];
                $product->purchase_price = $item['purchase_price'];
                if (isset($item['mrp'])) {
                    $product->mrp = $item['mrp'];
                }
                $product->save();

                // Log movement
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'in',
                    'quantity' => $item['quantity'],
                    'reference_type' => 'purchase',
                    'reference_id' => $purchase->id,
                ]);

                // Create product batch
                $product->batches()->create([
                    'batch_number' => $item['batch_number'] ?? null,
                    'original_quantity' => $item['quantity'],
                    'remaining_quantity' => $item['quantity'],
                    'purchase_price' => $item['purchase_price'],
                    'mrp' => $item['mrp'] ?? $product->mrp ?? 0,
                    'reference_type' => 'purchase',
                    'reference_id' => $purchase->id,
                ]);
            }

            $purchase->load('items');
            return $purchase;
        });
    }

    public function recordPayment(Supplier $supplier, array $data)
    {
        return DB::transaction(function () use ($supplier, $data) {
            $createdPayments = [];
            $paymentsToProcess = !empty($data['payments']) ? $data['payments'] : [
                ['amount' => $data['amount'], 'payment_mode' => $data['payment_mode'] ?? 'Cash']
            ];

            $specificPurchaseId = $data['supplier_purchase_id'] ?? null;

            foreach ($paymentsToProcess as $paymentData) {
                $amountToAllocate = (float) $paymentData['amount'];

                if ($specificPurchaseId) {
                    // Payment is for a specific purchase
                    $payment = $supplier->payments()->create([
                        'supplier_purchase_id' => $specificPurchaseId,
                        'date' => $data['date'],
                        'notes' => $data['notes'] ?? null,
                        'amount' => $amountToAllocate,
                        'payment_mode' => $paymentData['payment_mode'],
                    ]);
                    $createdPayments[] = $payment;
                    
                    $purchase = SupplierPurchase::find($specificPurchaseId);
                    if ($purchase) {
                        $purchase->increment('paid_amount', $amountToAllocate);
                    }
                } else {
                    // General payment - auto-allocate to oldest unpaid bills
                    $unpaidPurchases = $supplier->purchases()
                        ->whereRaw('bill_amount > paid_amount')
                        ->orderBy('purchase_date', 'asc')
                        ->orderBy('id', 'asc')
                        ->get();

                    foreach ($unpaidPurchases as $purchase) {
                        if ($amountToAllocate <= 0) break;

                        $due = $purchase->bill_amount - $purchase->paid_amount;
                        $allocation = min($due, $amountToAllocate);

                        $payment = $supplier->payments()->create([
                            'supplier_purchase_id' => $purchase->id,
                            'date' => $data['date'],
                            'notes' => $data['notes'] ?? null,
                            'amount' => $allocation,
                            'payment_mode' => $paymentData['payment_mode'],
                        ]);
                        $createdPayments[] = $payment;

                        $purchase->increment('paid_amount', $allocation);
                        $amountToAllocate -= $allocation;
                    }

                    // If there is still amount left after paying all bills, save as unlinked advance
                    if ($amountToAllocate > 0) {
                        $payment = $supplier->payments()->create([
                            'supplier_purchase_id' => null,
                            'date' => $data['date'],
                            'notes' => $data['notes'] ?? null,
                            'amount' => $amountToAllocate,
                            'payment_mode' => $paymentData['payment_mode'],
                        ]);
                        $createdPayments[] = $payment;
                    }
                }
            }

            return collect($createdPayments);
        });
    }

    public function recordPurchaseReturn(Supplier $supplier, array $data)
    {
        return DB::transaction(function () use ($supplier, $data) {
            $businessId = app('current_business_id') ?? (auth()->check() ? (auth()->user()->business_id ?? auth()->user()->businesses()->first()?->id) : null);
            $business = \App\Models\Business::find($businessId);

            // Generate return number
            $prefix = $business->settings['return_prefix'] ?? 'RET-';
            $lastReturn = PurchaseReturn::where('business_id', $businessId)
                ->orderBy('id', 'desc')
                ->first();
            $nextNumber = $lastReturn ? $lastReturn->id + 1 : 1;
            $returnNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $purchaseReturn = PurchaseReturn::create([
                'business_id' => $businessId,
                'supplier_id' => $supplier->id,
                'supplier_purchase_id' => $data['supplier_purchase_id'] ?? null,
                'return_number' => $returnNumber,
                'total_amount' => $totalAmount,
                'return_date' => $data['return_date'],
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'completed',
            ]);

            foreach ($data['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['unit_price'];

                PurchaseReturnItem::create([
                    'purchase_return_id' => $purchaseReturn->id,
                    'product_id' => $item['product_id'],
                    'product_batch_id' => $item['product_batch_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $itemTotal,
                ]);

                // Reduce product stock
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->quantity = max(0, $product->quantity - $item['quantity']);
                    $product->save();
                }

                // Reduce batch stock if batch specified
                if (!empty($item['product_batch_id'])) {
                    $batch = ProductBatch::find($item['product_batch_id']);
                    if ($batch) {
                        $batch->remaining_quantity = max(0, $batch->remaining_quantity - $item['quantity']);
                        $batch->save();
                    }
                }

                // Log inventory movement
                InventoryMovement::create([
                    'product_id' => $item['product_id'],
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'reference_type' => 'purchase_return',
                    'reference_id' => $purchaseReturn->id,
                ]);
            }

            // Reduce the original purchase bill_amount so outstanding auto-adjusts
            if (!empty($data['supplier_purchase_id'])) {
                $purchase = SupplierPurchase::find($data['supplier_purchase_id']);
                if ($purchase) {
                    $purchase->bill_amount = max(0, $purchase->bill_amount - $totalAmount);
                    $purchase->save();
                }
            }

            $purchaseReturn->load('items.product');
            return $purchaseReturn;
        });
    }

    public function getSupplierLedger(Supplier $supplier, ?string $startDate = null, ?string $endDate = null)
    {
        $entries = collect();

        // Purchases → Debit (bill amount increases outstanding)
        foreach ($supplier->purchases as $purchase) {
            $entries->push([
                'id' => 'purchase_' . $purchase->id,
                'date' => $purchase->purchase_date instanceof \Carbon\Carbon
                    ? $purchase->purchase_date->format('Y-m-d')
                    : $purchase->purchase_date,
                'type' => 'purchase',
                'reference' => $purchase->purchase_number,
                'particulars' => 'Purchase ' . $purchase->purchase_number,
                'debit' => (float) $purchase->bill_amount,
                'credit' => 0,
                'created_at' => $purchase->created_at,
            ]);
        }

        // Payments → Credit (reduces outstanding)
        foreach ($supplier->payments as $payment) {
            $entries->push([
                'id' => 'payment_' . $payment->id,
                'date' => $payment->date instanceof \Carbon\Carbon
                    ? $payment->date->format('Y-m-d')
                    : $payment->date,
                'type' => 'payment',
                'reference' => $payment->payment_mode,
                'particulars' => 'Payment (' . $payment->payment_mode . ')' . ($payment->notes ? ' - ' . $payment->notes : ''),
                'debit' => 0,
                'credit' => (float) $payment->amount,
                'created_at' => $payment->created_at,
            ]);
        }

        // Purchase Returns → Credit (reduces outstanding)
        foreach ($supplier->purchaseReturns as $return) {
            $entries->push([
                'id' => 'return_' . $return->id,
                'date' => $return->return_date instanceof \Carbon\Carbon
                    ? $return->return_date->format('Y-m-d')
                    : $return->return_date,
                'type' => 'return',
                'reference' => $return->return_number,
                'particulars' => 'Return ' . $return->return_number . ($return->reason ? ' - ' . $return->reason : ''),
                'debit' => 0,
                'credit' => (float) $return->total_amount,
                'created_at' => $return->created_at,
            ]);
        }

        // Sort by date ASC first (for running balance calculation)
        $sorted = $entries->sortBy([
            ['date', 'asc'],
            ['created_at', 'asc'],
        ])->values();

        // Calculate running balance on ALL entries first
        $balance = 0;
        $ledger = $sorted->map(function ($entry) use (&$balance) {
            $balance += $entry['debit'] - $entry['credit'];
            $entry['balance'] = $balance;
            return $entry;
        });

        // Apply date filter if provided
        $openingBalance = 0;
        if ($startDate || $endDate) {
            // Calculate opening balance from entries before start date
            if ($startDate) {
                $openingBalance = $ledger->filter(function ($entry) use ($startDate) {
                    return $entry['date'] < $startDate;
                })->reduce(function ($carry, $entry) {
                    return $carry + $entry['debit'] - $entry['credit'];
                }, 0);
            }

            $ledger = $ledger->filter(function ($entry) use ($startDate, $endDate) {
                if ($startDate && $entry['date'] < $startDate) return false;
                if ($endDate && $entry['date'] > $endDate) return false;
                return true;
            });

            // Recalculate running balance within the filtered range
            $runningBalance = $openingBalance;
            $ledger = $ledger->map(function ($entry) use (&$runningBalance) {
                $runningBalance += $entry['debit'] - $entry['credit'];
                $entry['balance'] = $runningBalance;
                return $entry;
            });
        }

        return [
            'entries' => $ledger->values()->all(),
            'total_debit' => $ledger->sum('debit'),
            'total_credit' => $ledger->sum('credit'),
            'closing_balance' => $ledger->count() > 0 ? $ledger->last()['balance'] : $openingBalance,
            'opening_balance' => $openingBalance,
        ];
    }
}

