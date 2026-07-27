<?php

namespace App\Services\Business;

use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;

class SaleReturnService
{
    /**
     * List sale returns with filters
     */
    public function listReturns(int $businessId, array $filters = [])
    {
        $query = SaleReturn::where('business_id', $businessId)
            ->with(['sale', 'customer', 'items.product', 'processedByUser']);

        if (!empty($filters['sale_id'])) {
            $query->where('sale_id', $filters['sale_id']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['refund_type'])) {
            $query->where('refund_type', $filters['refund_type']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"))
                  ->orWhereHas('sale', fn($s) => $s->where('invoice_number', 'like', "%{$search}%"));
            });
        }

        if (!empty($filters['from_date'])) {
            $query->where('return_date', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->where('return_date', '<=', $filters['to_date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Create and auto-approve a sale return
     */
    public function createReturn(int $businessId, array $data): SaleReturn
    {
        return DB::transaction(function () use ($businessId, $data) {
            $sale = Sale::where('business_id', $businessId)->findOrFail($data['sale_id']);

            // Generate return number
            $lastReturn = SaleReturn::where('business_id', $businessId)
                ->orderBy('id', 'desc')
                ->first();
            $nextNum = $lastReturn ? ((int) str_replace('SR-', '', $lastReturn->return_number)) + 1 : 1;
            $returnNumber = 'SR-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

            $totalReturnAmount = 0;
            $returnItemsData = [];

            foreach ($data['items'] as $item) {
                $saleItem = SaleItem::where('sale_id', $sale->id)->findOrFail($item['sale_item_id']);

                // Validate: return quantity must not exceed original qty minus already returned qty
                $alreadyReturned = SaleReturnItem::where('sale_item_id', $saleItem->id)->sum('quantity');
                $maxReturnable = $saleItem->quantity - $alreadyReturned;

                if ($item['quantity'] > $maxReturnable) {
                    $productName = $saleItem->product->model_name ?? 'Item';
                    throw new \Exception("Cannot return {$item['quantity']} of '{$productName}'. Maximum returnable: {$maxReturnable}.");
                }

                $returnAmount = $saleItem->unit_price * $item['quantity'];
                $totalReturnAmount += $returnAmount;

                $returnItemsData[] = [
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $saleItem->product_id,
                    'product_batch_id' => $saleItem->product_batch_id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $saleItem->unit_price,
                    'return_amount' => $returnAmount,
                ];
            }

            $refundType = $data['refund_type'] ?? 'refund';

            // Create SaleReturn (auto-approved)
            $saleReturn = SaleReturn::create([
                'business_id' => $businessId,
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id,
                'return_number' => $returnNumber,
                'total_return_amount' => $totalReturnAmount,
                'refund_type' => $refundType,
                'refund_amount' => $refundType === 'refund' ? $totalReturnAmount : 0,
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'approved',
                'return_date' => $data['return_date'] ?? now()->toDateString(),
                'processed_by' => auth()->id(),
            ]);

            // Create return items
            foreach ($returnItemsData as $rid) {
                $saleReturn->items()->create($rid);
            }

            // Process return: restore stock
            foreach ($returnItemsData as $rid) {
                if (!empty($rid['product_batch_id'])) {
                    $batch = ProductBatch::find($rid['product_batch_id']);
                    if ($batch) {
                        $batch->increment('remaining_quantity', $rid['quantity']);
                        $product = $batch->product;
                        if ($product) {
                            $product->increment('quantity', $rid['quantity']);
                        }
                    }
                } else {
                    $product = Product::find($rid['product_id']);
                    if ($product) {
                        $product->increment('quantity', $rid['quantity']);
                    }
                }

                InventoryMovement::create([
                    'product_id' => $rid['product_id'],
                    'type' => 'in',
                    'quantity' => $rid['quantity'],
                    'reference_type' => 'sale_return',
                    'reference_id' => $saleReturn->id,
                ]);
            }

            // Reverse profit on the sale
            $profitReduction = 0;
            foreach ($returnItemsData as $rid) {
                $saleItem = SaleItem::find($rid['sale_item_id']);
                if ($saleItem && $saleItem->quantity > 0) {
                    // Per-item profit = total item profit / total item qty
                    $perItemProfit = $saleItem->profit / $saleItem->quantity;
                    $profitReduction += $perItemProfit * $rid['quantity'];
                }
            }

            if ($profitReduction > 0) {
                $sale->update([
                    'total_profit' => max(0, $sale->total_profit - $profitReduction),
                    'net_profit' => $sale->net_profit - $profitReduction,
                ]);
            }

            // Removed credit note logic

            return $saleReturn->load(['sale', 'customer', 'items.product', 'processedByUser']);
        });
    }

    /**
     * Get a single sale return
     */
    public function getReturn(int $businessId, int $returnId): SaleReturn
    {
        return SaleReturn::where('business_id', $businessId)
            ->with(['sale.items.product', 'customer', 'items.product', 'processedByUser'])
            ->findOrFail($returnId);
    }

    /**
     * Get returnable items for a sale (items not yet fully returned)
     */
    public function getReturnableItems(int $businessId, int $saleId): array
    {
        $sale = Sale::where('business_id', $businessId)
            ->with(['items.product.brand', 'items.batch', 'customer'])
            ->findOrFail($saleId);

        $returnableItems = [];

        foreach ($sale->items as $saleItem) {
            $alreadyReturned = SaleReturnItem::where('sale_item_id', $saleItem->id)->sum('quantity');
            $returnable = $saleItem->quantity - $alreadyReturned;

            if ($returnable > 0) {
                $returnableItems[] = [
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $saleItem->product_id,
                    'product_batch_id' => $saleItem->product_batch_id,
                    'product' => $saleItem->product,
                    'batch' => $saleItem->batch,
                    'original_quantity' => $saleItem->quantity,
                    'already_returned' => (int) $alreadyReturned,
                    'returnable_quantity' => $returnable,
                    'unit_price' => $saleItem->unit_price,
                    'imei_1' => $saleItem->imei_1,
                    'imei_2' => $saleItem->imei_2,
                    'serial_no' => $saleItem->serial_no,
                ];
            }
        }

        return [
            'sale' => $sale,
            'returnable_items' => $returnableItems,
        ];
    }

}
