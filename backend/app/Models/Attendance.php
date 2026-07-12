<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use App\Traits\LogsActivity;

class Attendance extends Model
{
    use HasFactory, BelongsToBusiness, LogsActivity;

    protected $fillable = [
        'business_id',
        'user_id',
        'date',
        'status',
        'check_in_time',
        'check_out_time',
        'check_in_photo',
        'check_out_photo',
        'check_in_latitude',
        'check_in_longitude',
        'check_out_latitude',
        'check_out_longitude',
        'is_within_geofence',
        'location_id',
        'notes',
        'approved_by',
    ];

    protected $casts = [
        'date' => 'date',
        'is_within_geofence' => 'boolean',
        'check_in_latitude' => 'float',
        'check_in_longitude' => 'float',
        'check_out_latitude' => 'float',
        'check_out_longitude' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function location()
    {
        return $this->belongsTo(BusinessLocation::class, 'location_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
