<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory, \App\Traits\BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'customer_id',
        'user_id',
        'invoice_number',
        'total_amount',
        'discount',
        'round_off',
        'final_amount',
        'paid_amount',
        'payment_mode',
        'status',
        'notes',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }

    public function emiDetail()
    {
        return $this->hasOne(EmiDetail::class);
    }
}
