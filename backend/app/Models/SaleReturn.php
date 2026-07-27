<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use App\Traits\LogsActivity;

class SaleReturn extends Model
{
    use HasFactory, BelongsToBusiness, LogsActivity;

    protected $fillable = [
        'business_id',
        'sale_id',
        'customer_id',
        'return_number',
        'total_return_amount',
        'refund_type',
        'refund_amount',
        'reason',
        'notes',
        'status',
        'return_date',
        'processed_by',
    ];

    protected $casts = [
        'return_date' => 'date',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function processedByUser()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function items()
    {
        return $this->hasMany(SaleReturnItem::class);
    }
}
