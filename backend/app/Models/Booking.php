<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use App\Traits\LogsActivity;

class Booking extends Model
{
    use HasFactory, BelongsToBusiness, LogsActivity;

    protected $fillable = [
        'business_id',
        'customer_id',
        'user_id',
        'booking_number',
        'total_amount',
        'advance_amount',
        'status',
        'converted_sale_id',
        'notes',
        'booking_date',
        'expected_delivery_date',
        'cancelled_at',
        'refund_amount',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'expected_delivery_date' => 'date',
        'cancelled_at' => 'datetime',
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
        return $this->hasMany(BookingItem::class);
    }

    public function payments()
    {
        return $this->hasMany(BookingPayment::class);
    }

    public function convertedSale()
    {
        return $this->belongsTo(Sale::class, 'converted_sale_id');
    }
}
