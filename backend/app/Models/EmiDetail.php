<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmiDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'financier_name',
        'down_payment',
        'loan_amount',
        'processing_fee',
        'tenure_months',
        'monthly_installment_amount',
        'first_emi_date',
        'is_payout_received',
        'payout_date',
    ];

    protected $casts = [
        'is_payout_received' => 'boolean',
        'payout_date' => 'date',
        'first_emi_date' => 'date',
    ];

    public function sale(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function installments()
    {
        return $this->hasMany(EmiInstallment::class, 'emi_detail_id');
    }
}
