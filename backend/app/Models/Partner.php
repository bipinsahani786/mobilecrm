<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partner extends Model
{
    use Filterable, SoftDeletes;
    protected $fillable = [
        'name',
        'email',
        'phone',
        'company_name',
        'referral_code',
        'commission_type',
        'commission_value',
        'is_recurring_commission',
        'custom_domain',
        'payout_details',
        'status',
        'user_id'
    ];

    protected $casts = [
        'is_recurring_commission' => 'boolean',
        'status' => 'boolean',
        'payout_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class);
    }

    /**
     * Get the total pending (unpaid) commission amount (Net of platform dues).
     */
    public function getPendingCommissionTotal(): float
    {
        $systemCollected = (float) $this->commissions()
            ->where('status', 'pending')
            ->where('payment_collected_by', 'system')
            ->sum('commission_amount');

        $platformDues = (float) $this->commissions()
            ->where('status', 'pending')
            ->where('payment_collected_by', 'partner')
            ->sum(\Illuminate\Support\Facades\DB::raw('amount_paid_by_tenant - commission_amount'));

        return $systemCollected - $platformDues;
    }

    /**
     * Get the available amount for payout (pending commissions minus pending payout requests).
     */
    public function getAvailablePayoutAmount(): float
    {
        $pendingCommission = $this->getPendingCommissionTotal();
        $pendingPayouts = (float) $this->payoutRequests()
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        return max(0, $pendingCommission - $pendingPayouts);
    }
}
