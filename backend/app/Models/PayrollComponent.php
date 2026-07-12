<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollComponent extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'type',
        'is_default'
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
