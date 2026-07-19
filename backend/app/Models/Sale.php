<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use App\Traits\LogsActivity;

class Sale extends Model
{
    use HasFactory, BelongsToBusiness, LogsActivity;

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
        'draft_data',
    ];

    protected $casts = [
        'date' => 'date',
        'draft_data' => 'array',
    ];

    protected $appends = ['public_url'];

    public function getPublicUrlAttribute()
    {
        return \Illuminate\Support\Facades\URL::signedRoute('invoice.verify', ['sale' => $this->id]);
    }

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
