<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\EmiDetail;
use App\Models\EmiInstallment;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmiController extends BaseController
{
    /**
     * Fetch EMI schedules for a specific customer.
     */
    public function getCustomerEmis($customerId)
    {
        $businessId = app('current_business_id');

        $emis = EmiDetail::whereHas('sale', function ($q) use ($customerId) {
            $q->where('customer_id', $customerId);
        })
        ->with(['sale:id,invoice_number,date,final_amount', 'installments' => function($q) {
            $q->orderBy('installment_number');
        }])
        ->orderByDesc('created_at')
        ->get();

        return $this->success($emis, 'Customer EMI records retrieved.');
    }

    /**
     * Mark an EMI installment as paid.
     */
    public function payInstallment(Request $request, $installmentId)
    {
        $request->validate([
            'payment_mode' => 'required|string|in:Cash,UPI,Card',
            'amount' => 'required|numeric|min:0.01',
            'paid_on' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $installment = EmiInstallment::with('emiDetail.sale')->findOrFail($installmentId);

        // Security check
        if ($installment->emiDetail->sale->business_id !== app('current_business_id')) {
            return $this->error('Unauthorized', 403);
        }

        if ($installment->status === 'paid') {
            return $this->error('This installment is already paid.', 400);
        }

        return DB::transaction(function () use ($installment, $request) {
            $sale = $installment->emiDetail->sale;
            $amount = $request->amount;

            // 1. Create a SalePayment record
            $payment = SalePayment::create([
                'sale_id' => $sale->id,
                'payment_mode' => $request->payment_mode,
                'amount' => $amount,
                'notes' => $request->notes ?? "EMI Installment #{$installment->installment_number}",
            ]);

            // 2. Update the Sale paid_amount
            $sale->increment('paid_amount', $amount);

            // 3. Mark the installment as paid
            $installment->update([
                'status' => 'paid',
                'paid_on' => $request->paid_on ?? now()->toDateString(),
                'payment_id' => $payment->id,
                'amount' => $amount, // Update if they paid a different amount
            ]);

            return $this->success('Installment marked as paid successfully.', $installment);
        });
    }

    /**
     * Mark the financier payout as received.
     */
    public function markPayoutReceived(Request $request, $emiDetailId)
    {
        $request->validate([
            'payout_date' => 'nullable|date',
        ]);

        $emiDetail = EmiDetail::whereHas('sale')->findOrFail($emiDetailId);

        if ($emiDetail->is_payout_received) {
            return $this->error('Payout already marked as received.', 400);
        }

        $emiDetail->update([
            'is_payout_received' => true,
            'payout_date' => $request->payout_date ?? now()->toDateString(),
        ]);

        return $this->success('Financier payout marked as received.', $emiDetail);
    }
}
