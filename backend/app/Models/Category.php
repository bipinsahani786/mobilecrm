<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToBusiness;

class Category extends Model
{
    use BelongsToBusiness, SoftDeletes;

    protected $fillable = ['business_id', 'name'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
