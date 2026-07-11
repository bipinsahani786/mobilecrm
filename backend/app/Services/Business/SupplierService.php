<?php

namespace App\Services\Business;

use App\Models\Supplier;
use App\Models\SupplierPurchase;
use App\Models\Product;
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

    public function recordPurchase(Supplier $supplier, array $data, $invoiceFile = null)
    {
        return DB::transaction(function () use ($supplier, $data, $invoiceFile) {
            $invoicePath = null;
            if ($invoiceFile) {
                $businessId = app()->has('current_business_id') ? app('current_business_id') : (auth()->check() ? auth()->user()->business_id : 'unknown');
                $invoicePath = $invoiceFile->store("invoices/business_{$businessId}", 'public');
            }

            $purchase = $supplier->purchases()->create([
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
            $payment = $supplier->payments()->create($data);

            // If this payment is linked to a specific bill, update the paid amount
            if (!empty($data['supplier_purchase_id'])) {
                $purchase = SupplierPurchase::find($data['supplier_purchase_id']);
                $purchase->increment('paid_amount', $data['amount']);
            }

            return $payment;
        });
    }
}
