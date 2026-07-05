<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Check if there is an active business ID set in the application context.
        if (app()->has('current_business_id')) {
            $businessId = app('current_business_id');
            $builder->where($model->getTable() . '.business_id', $businessId);
        }
    }
}
