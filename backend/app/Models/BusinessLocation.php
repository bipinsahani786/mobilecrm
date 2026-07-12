<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessLocation extends Model
{
    use HasFactory, \App\Traits\BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'name',
        'latitude',
        'longitude',
        'radius_meters',
        'address',
        'is_default',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meters' => 'integer',
        'is_default' => 'boolean',
    ];

    /**
     * Calculate distance in meters from given coordinates using Haversine formula.
     */
    public function distanceFrom(float $lat, float $lng): float
    {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad($this->latitude);
        $lngFrom = deg2rad($this->longitude);
        $latTo = deg2rad($lat);
        $lngTo = deg2rad($lng);

        $latDelta = $latTo - $latFrom;
        $lngDelta = $lngTo - $lngFrom;

        $a = sin($latDelta / 2) ** 2 +
             cos($latFrom) * cos($latTo) * sin($lngDelta / 2) ** 2;

        return 2 * $earthRadius * asin(sqrt($a));
    }

    /**
     * Check if given coordinates are within this location's geo-fence.
     */
    public function isWithinFence(float $lat, float $lng): bool
    {
        return $this->distanceFrom($lat, $lng) <= $this->radius_meters;
    }
}
