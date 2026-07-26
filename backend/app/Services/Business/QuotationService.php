<?php

namespace App\Services\Business;

use App\Models\Quotation;
use App\Models\QuotationItem;
use Illuminate\Support\Facades\DB;

class QuotationService
{
    public function getQuotations($filters = [], $perPage = 15)
    {
        $query = Quotation::with(['customer', 'user', 'items.product'])
            ->orderByDesc('created_at');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }

        return $query->paginate($perPage);
    }

    public function createQuotation(array $data)
    {
        return DB::transaction(function () use ($data) {
            $businessId = app('current_business_id');
            $business = \App\Models\Business::find($businessId);

            // Generate Quotation Number
            $prefix = 'QUO-';
            $lastQuotation = Quotation::where('business_id', $businessId)
                ->where('quotation_number', 'like', $prefix . '%')
                ->orderByRaw("CAST(SUBSTRING(quotation_number, " . (strlen($prefix) + 1) . ") AS UNSIGNED) DESC")
                ->first();

            $nextSeq = 1;
            if ($lastQuotation) {
                $lastNum = (int) str_replace($prefix, '', $lastQuotation->quotation_number);
                $nextSeq = $lastNum + 1;
            }
            $quotationNumber = $prefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);

            // Calculate totals
            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $roundOff = (float) ($data['round_off'] ?? 0);
            $finalAmount = $totalAmount - $discount + $roundOff;

            $quotation = Quotation::create([
                'business_id' => $businessId,
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => auth()->id(),
                'quotation_number' => $quotationNumber,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'round_off' => $roundOff,
                'final_amount' => $finalAmount,
                'notes' => $data['notes'] ?? null,
                'valid_until' => $data['valid_until'] ?? now()->addDays(15)->format('Y-m-d'),
                'status' => 'draft',
                'date' => $data['date'] ?? now()->format('Y-m-d'),
            ]);

            // Create Items (NO stock deduction)
            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $quotation->items()->create([
                    'product_id' => $item['product_id'],
                    'product_batch_id' => $item['product_batch_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }

            return $quotation->load(['customer', 'items.product']);
        });
    }

    public function updateQuotation(Quotation $quotation, array $data)
    {
        return DB::transaction(function () use ($quotation, $data) {
            if ($quotation->status === 'converted') {
                throw new \Exception('Cannot edit a converted quotation.');
            }

            $totalAmount = 0;
            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $totalAmount += $item['quantity'] * $item['unit_price'];
                }
            }

            $discount = (float) ($data['discount'] ?? 0);
            $roundOff = (float) ($data['round_off'] ?? 0);
            $finalAmount = $totalAmount - $discount + $roundOff;

            $quotation->update([
                'customer_id' => $data['customer_id'] ?? null,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'round_off' => $roundOff,
                'final_amount' => $finalAmount,
                'notes' => $data['notes'] ?? null,
                'valid_until' => $data['valid_until'] ?? $quotation->valid_until,
                'status' => $data['status'] ?? $quotation->status,
                'date' => $data['date'] ?? $quotation->date,
            ]);

            // Recreate items
            if (!empty($data['items'])) {
                $quotation->items()->delete();
                foreach ($data['items'] as $item) {
                    $subtotal = $item['quantity'] * $item['unit_price'];
                    $quotation->items()->create([
                        'product_id' => $item['product_id'],
                        'product_batch_id' => $item['product_batch_id'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            return $quotation->load(['customer', 'items.product']);
        });
    }

    public function convertToBill(Quotation $quotation)
    {
        if ($quotation->status === 'converted') {
            throw new \Exception('This quotation has already been converted.');
        }

        return DB::transaction(function () use ($quotation) {
            $quotation->load('items');

            // Build sale data from quotation
            $saleData = [
                'customer_id' => $quotation->customer_id,
                'discount' => $quotation->discount,
                'round_off' => $quotation->round_off,
                'notes' => "Converted from Quotation: {$quotation->quotation_number}",
                'date' => now()->format('Y-m-d'),
                'status' => 'completed',
                'payment_mode' => 'Cash',
                'payments' => [
                    [
                        'payment_mode' => 'Cash',
                        'amount' => $quotation->final_amount,
                    ]
                ],
                'items' => $quotation->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_batch_id' => $item->product_batch_id,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                    ];
                })->toArray(),
            ];

            $saleService = app(SaleService::class);
            $sale = $saleService->createSale($saleData);

            // Mark quotation as converted
            $quotation->update([
                'status' => 'converted',
                'converted_sale_id' => $sale->id,
            ]);

            return [
                'quotation' => $quotation->fresh()->load(['customer', 'items.product']),
                'sale' => $sale,
            ];
        });
    }

    public function deleteQuotation(Quotation $quotation)
    {
        if ($quotation->status === 'converted') {
            throw new \Exception('Cannot delete a converted quotation.');
        }
        $quotation->items()->delete();
        $quotation->delete();
    }
}
