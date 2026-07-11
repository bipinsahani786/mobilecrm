<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmiInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'emi_detail_id',
        'installment_number',
        'amount',
        'due_date',
        'status',
        'paid_on',
        'payment_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_on' => 'date',
    ];

    public function emiDetail(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(EmiDetail::class);
    }

    public function payment(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SalePayment::class, 'payment_id');
    }
}
