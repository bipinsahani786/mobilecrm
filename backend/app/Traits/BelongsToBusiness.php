<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;

trait BelongsToBusiness
{
    /**
     * The "booted" method of the trait.
     */
    protected static function bootBelongsToBusiness(): void
    {
        // 1. Automatically apply the TenantScope to isolate data.
        static::addGlobalScope(new TenantScope);

        // 2. Automatically set the business_id when creating new records.
        static::creating(function ($model) {
            if (empty($model->business_id)) {
                if (app()->has('current_business_id')) {
                    $model->business_id = app('current_business_id');
                }
                // Removed invalid fallback to auth()->user()->business_id since users belongToMany businesses
            }
        });
    }

    /**
     * Define the relationship to the Business.
     */
    public function business()
    {
        return $this->belongsTo(\App\Models\Business::class);
    }
}
