<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryAdvance extends Model
{
    use HasFactory, \App\Traits\BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'user_id',
        'amount',
        'given_date',
        'deduct_in_month',
        'is_deducted',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'given_date' => 'date',
        'is_deducted' => 'boolean',
        'status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
