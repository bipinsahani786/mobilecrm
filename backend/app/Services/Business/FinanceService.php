<?php

namespace App\Services\Business;

use App\Models\EmiDetail;
use App\Models\SalePayment;

class FinanceService
{
    public function getPendingPayouts($perPage = 15, $search = null, $financier = null, $startDate = null, $endDate = null)
    {
        $query = EmiDetail::whereHas('sale', function ($query) {
                $query->where('business_id', app('current_business_id'));
            })
            ->with(['sale.customer', 'sale.items.product'])
            ->where('is_payout_received', false)
            ->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('financier_name', 'like', "%{$search}%")
                  ->orWhereHas('sale', function ($sq) use ($search) {
                      $sq->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%")
                               ->orWhere('phone', 'like', "%{$search}%");
                        });
                  });
            });
        }

        if ($financier) {
            $query->where('financier_name', $financier);
        }

        if ($startDate) {
            $query->whereHas('sale', function ($sq) use ($startDate) {
                $sq->whereDate('date', '>=', $startDate);
            });
        }

        if ($endDate) {
            $query->whereHas('sale', function ($sq) use ($endDate) {
                $sq->whereDate('date', '<=', $endDate);
            });
        }

        return $query->paginate($perPage);
    }

    public function getCompletedPayouts($perPage = 15, $search = null, $financier = null, $startDate = null, $endDate = null)
    {
        $query = EmiDetail::whereHas('sale', function ($query) {
                $query->where('business_id', app('current_business_id'));
            })
            ->with(['sale.customer', 'sale.items.product'])
            ->where('is_payout_received', true)
            ->orderByDesc('payout_date');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('financier_name', 'like', "%{$search}%")
                  ->orWhereHas('sale', function ($sq) use ($search) {
                      $sq->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%")
                               ->orWhere('phone', 'like', "%{$search}%");
                        });
                  });
            });
        }

        if ($financier) {
            $query->where('financier_name', $financier);
        }

        if ($startDate) {
            $query->whereHas('sale', function ($sq) use ($startDate) {
                $sq->whereDate('date', '>=', $startDate);
            });
        }

        if ($endDate) {
            $query->whereHas('sale', function ($sq) use ($endDate) {
                $sq->whereDate('date', '<=', $endDate);
            });
        }

        return $query->paginate($perPage);
    }

    public function markPayoutReceived(EmiDetail $emiDetail, $date = null)
    {
        // Must check if sale belongs to current business
        if ($emiDetail->sale->business_id !== app('current_business_id')) {
            throw new \Exception("Unauthorized access to EMI detail");
        }

        $emiDetail->update([
            'is_payout_received' => true,
            'payout_date' => $date ?? now()->toDateString(),
        ]);

        // When financier pays the shop, it's essentially completing the payment for the sale
        // So we should log it as a payment against the sale.
        // Wait, the EMI sale might already have been logged as "amount paid" = down payment.
        // Let's add a payment record.
        SalePayment::create([
            'sale_id' => $emiDetail->sale_id,
            'payment_mode' => 'Financier Payout',
            'amount' => $emiDetail->loan_amount - $emiDetail->processing_fee, // Assuming processing fee is deducted
            'notes' => 'Payout received from ' . $emiDetail->financier_name,
        ]);

        // Also update the sale's paid_amount
        $emiDetail->sale->increment('paid_amount', $emiDetail->loan_amount - $emiDetail->processing_fee);

        return $emiDetail->fresh();
    }
}
