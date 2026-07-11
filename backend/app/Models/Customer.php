<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory, \App\Traits\BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'name',
        'phone',
        'address',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
