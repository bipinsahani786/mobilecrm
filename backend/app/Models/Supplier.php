<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

use App\Traits\BelongsToBusiness;

class Supplier extends Model
{
    use HasFactory, BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'custom_id',
        'name',
        'phone',
        'address',
        'items_supplied',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($supplier) {
            // Auto generate custom_id if empty
            if (empty($supplier->custom_id)) {
                $businessId = app()->has('current_business_id') ? app('current_business_id') : null;
                if ($businessId) {
                    $business = \App\Models\Business::find($businessId);
                    $prefix = $business->settings['supplier_prefix'] ?? 'SUP-';
                    $lastSupplier = static::withoutGlobalScopes()
                                        ->where('business_id', $businessId)
                                        ->orderBy('id', 'desc')
                                        ->first();
                    $nextId = $lastSupplier ? $lastSupplier->id + 1 : 1;
                    $supplier->custom_id = $prefix . str_pad($nextId, 4, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    // business() relationship is inherited from BelongsToBusiness

    public function purchases(): HasMany
    {
        return $this->hasMany(SupplierPurchase::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SupplierPayment::class);
    }
}
