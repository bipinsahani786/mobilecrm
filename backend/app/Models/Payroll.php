<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory, \App\Traits\BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'user_id',
        'month',
        'total_days',
        'present_days',
        'absent_days',
        'half_days',
        'paid_leaves',
        'unpaid_leaves',
        'week_offs',
        'holidays',
        'base_salary',
        'per_day_salary',
        'deduction',
        'total_commission',
        'bonus',
        'advance_deduction',
        'salary_components',
        'salary_type',
        'final_salary',
        'notes',
        'status',
        'paid_date',
    ];

    protected $casts = [
        'base_salary' => 'float',
        'per_day_salary' => 'float',
        'deduction' => 'float',
        'total_commission' => 'float',
        'bonus' => 'float',
        'advance_deduction' => 'float',
        'final_salary' => 'float',
        'salary_components' => 'array',
        'paid_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
