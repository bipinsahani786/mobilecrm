<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'bill_amount',
        'paid_amount',
        'purchase_date',
        'due_date',
        'invoice_file',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'due_date' => 'date',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SupplierPurchaseItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SupplierPayment::class);
    }
}
