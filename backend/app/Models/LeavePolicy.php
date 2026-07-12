<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeavePolicy extends Model
{
    use HasFactory, \App\Traits\BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'leave_type',
        'monthly_quota',
        'is_paid',
    ];

    protected $casts = [
        'monthly_quota' => 'float',
        'is_paid' => 'boolean',
    ];
}
