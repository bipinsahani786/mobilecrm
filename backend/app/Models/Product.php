<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToBusiness;
use App\Traits\LogsActivity;

class Product extends Model
{
    use HasFactory, BelongsToBusiness, SoftDeletes, LogsActivity;

    protected $fillable = [
        'business_id', 'category_id', 'brand_id', 'model_name',
        'imei', 'serial_no', 'variant', 'purchase_price',
        'mrp', 'quantity', 'supplier_id', 'status'
    ];

    protected $appends = ['inventory_value'];
    protected $hidden = [];

    public function getInventoryValueAttribute()
    {
        $batchValue = 0;
        $batchQuantity = 0;

        if ($this->relationLoaded('batches') && $this->batches->isNotEmpty()) {
            $batchValue = $this->batches->sum(function($batch) {
                return $batch->remaining_quantity * $batch->purchase_price;
            });
            $batchQuantity = $this->batches->sum('remaining_quantity');
        }

        $unbatchedQuantity = $this->quantity - $batchQuantity;
        if ($unbatchedQuantity > 0) {
            $batchValue += $unbatchedQuantity * $this->purchase_price;
        }

        return $batchValue;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the brand that owns the product.
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }
    public function batches()
    {
        return $this->hasMany(ProductBatch::class);
    }
}
