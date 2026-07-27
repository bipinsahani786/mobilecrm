<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'payment_mode',
        'amount',
        'notes',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
