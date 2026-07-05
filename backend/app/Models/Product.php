<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToBusiness;

class Product extends Model
{
    use BelongsToBusiness, SoftDeletes;

    protected $fillable = [
        'business_id', 'category_id', 'brand_id', 'model_name',
        'imei', 'serial_no', 'variant', 'purchase_price',
        'mrp', 'quantity', 'supplier_id', 'status'
    ];

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
}
