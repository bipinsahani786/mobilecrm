<?php

namespace App\Services\Business;

use App\Models\Booking;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;

class BookingService
{
    /**
     * List bookings with filters
     */
    public function listBookings(int $businessId, array $filters = [])
    {
        $query = Booking::where('business_id', $businessId)
            ->with(['customer', 'items.product.brand', 'items.batch', 'user', 'convertedSale']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"))
                  ->orWhereHas('items.product', fn($p) => $p->where('model_name', 'like', "%{$search}%"));
            });
        }

        if (!empty($filters['from_date'])) {
            $query->where('booking_date', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->where('booking_date', '<=', $filters['to_date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Create a new booking
     */
    public function createBooking(int $businessId, array $data): Booking
    {
        return DB::transaction(function () use ($businessId, $data) {
            // Generate booking number
            $lastBooking = Booking::where('business_id', $businessId)
                ->orderBy('id', 'desc')
                ->first();
            $nextNum = $lastBooking ? ((int) str_replace('BK-', '', $lastBooking->booking_number)) + 1 : 1;
            $bookingNumber = 'BK-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

            $totalAmount = collect($data['items'])->sum(function($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $booking = Booking::create([
                'business_id' => $businessId,
                'customer_id' => $data['customer_id'],
                'user_id' => auth()->id(),
                'booking_number' => $bookingNumber,
                'total_amount' => $totalAmount,
                'advance_amount' => $data['advance_amount'] ?? 0,
                'status' => 'booked',
                'notes' => $data['notes'] ?? null,
                'booking_date' => $data['booking_date'] ?? now()->toDateString(),
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
            ]);

            // Create Split Payments
            if (!empty($data['payments'])) {
                foreach ($data['payments'] as $payment) {
                    $booking->payments()->create([
                        'payment_mode' => $payment['payment_mode'],
                        'amount' => $payment['amount'],
                        'notes' => $payment['notes'] ?? null,
                    ]);
                }
            } elseif (!empty($data['payment_mode']) && $data['advance_amount'] > 0) {
                // Fallback for single payment mode
                $booking->payments()->create([
                    'payment_mode' => $data['payment_mode'],
                    'amount' => $data['advance_amount'],
                    'notes' => null,
                ]);
            }

            // Check if business wants to reserve stock on booking
            $business = \App\Models\Business::find($businessId);
            $reserveStock = $business->settings['booking_stock_reserve'] ?? false;

            foreach ($data['items'] as $itemData) {
                $booking->items()->create([
                    'product_id' => $itemData['product_id'],
                    'product_batch_id' => $itemData['product_batch_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                ]);

                if ($reserveStock) {
                    // Deduct stock
                    if (!empty($itemData['product_batch_id'])) {
                        $batch = ProductBatch::find($itemData['product_batch_id']);
                        if ($batch) {
                            $batch->decrement('remaining_quantity', $itemData['quantity']);
                            $product = $batch->product;
                            $product->decrement('quantity', $itemData['quantity']);
                        }
                    } else {
                        $product = Product::find($itemData['product_id']);
                        if ($product) {
                            $product->decrement('quantity', $itemData['quantity']);
                        }
                    }

                    InventoryMovement::create([
                        'product_id' => $itemData['product_id'],
                        'type' => 'out',
                        'quantity' => $itemData['quantity'],
                        'reference_type' => 'booking_reserve',
                        'reference_id' => $booking->id,
                    ]);
                }
            }

            return $booking->load(['customer', 'items.product.brand', 'items.batch', 'user']);
        });
    }

    /**
     * Get a single booking
     */
    public function getBooking(int $businessId, int $bookingId): Booking
    {
        return Booking::where('business_id', $businessId)
            ->with(['customer', 'items.product.brand', 'items.batch', 'user', 'convertedSale', 'payments'])
            ->findOrFail($bookingId);
    }

    /**
     * Cancel a booking
     */
    public function cancelBooking(Booking $booking, array $data = []): Booking
    {
        return DB::transaction(function () use ($booking, $data) {
            if ($booking->status !== 'booked') {
                throw new \Exception('Only booked bookings can be cancelled.');
            }

            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'refund_amount' => $data['refund_amount'] ?? $booking->advance_amount,
                'notes' => $data['notes'] ?? $booking->notes,
            ]);

            // Restore stock if it was reserved
            $business = \App\Models\Business::find($booking->business_id);
            $reserveStock = $business->settings['booking_stock_reserve'] ?? false;

            if ($reserveStock) {
                foreach ($booking->items as $item) {
                    if ($item->product_batch_id) {
                        $batch = ProductBatch::find($item->product_batch_id);
                        if ($batch) {
                            $batch->increment('remaining_quantity', $item->quantity);
                            $product = $batch->product;
                            $product->increment('quantity', $item->quantity);
                        }
                    } else {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->increment('quantity', $item->quantity);
                        }
                    }

                    InventoryMovement::create([
                        'product_id' => $item->product_id,
                        'type' => 'in',
                        'quantity' => $item->quantity,
                        'reference_type' => 'booking_cancel',
                        'reference_id' => $booking->id,
                    ]);
                }
            }

            return $booking->load(['customer', 'items.product.brand', 'items.batch', 'user']);
        });
    }

    /**
     * Get booking data formatted for POS conversion
     */
    public function getConversionData(Booking $booking): array
    {
        if ($booking->status !== 'booked') {
            throw new \Exception('Only booked bookings can be converted.');
        }

        $items = $booking->items->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'product_batch_id' => $item->product_batch_id,
                'product' => $item->product->load('brand'),
                'batch' => $item->batch,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
            ];
        })->toArray();

        return [
            'booking_id' => $booking->id,
            'customer_id' => $booking->customer_id,
            'customer' => $booking->customer,
            'items' => $items,
            'advance_amount' => $booking->advance_amount,
            'stock_already_reserved' => \App\Models\Business::find($booking->business_id)->settings['booking_stock_reserve'] ?? false,
        ];
    }

    /**
     * Mark booking as converted (called after sale is created)
     */
    public function markAsConverted(Booking $booking, int $saleId): Booking
    {
        $booking->update([
            'status' => 'converted',
            'converted_sale_id' => $saleId,
        ]);

        return $booking;
    }
}
