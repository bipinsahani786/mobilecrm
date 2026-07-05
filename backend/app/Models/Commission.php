<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Filterable;

class Commission extends Model
{
    use Filterable;
    protected $fillable = [
        'partner_id',
        'business_id',
        'plan_id',
        'amount_paid_by_tenant',
        'commission_amount',
        'status',
        'paid_at',
        'payment_collected_by',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
