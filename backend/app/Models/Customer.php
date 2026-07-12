<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use App\Traits\LogsActivity;

class Customer extends Model
{
    use HasFactory, BelongsToBusiness, LogsActivity;

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
