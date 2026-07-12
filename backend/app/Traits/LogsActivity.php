<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('created', "Created " . class_basename($model), ['attributes' => $model->getAttributes()]);
        });

        static::updated(function ($model) {
            $model->logActivity('updated', "Updated " . class_basename($model), [
                'old' => $model->getOriginal(),
                'new' => $model->getChanges(),
            ]);
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted', "Deleted " . class_basename($model), ['old' => $model->getOriginal()]);
        });
    }

    /**
     * Log an activity for the model.
     */
    public function logActivity(string $action, ?string $description = null, ?array $properties = null): ?ActivityLog
    {
        // Don't log if we are seeding or there is no auth context in API unless explicitly wanted.
        if (app()->runningInConsole()) return null;

        $tenantId = null;
        if (property_exists($this, 'business_id') || isset($this->business_id)) {
            $tenantId = $this->business_id;
        } elseif (property_exists($this, 'tenant_id') || isset($this->tenant_id)) {
            $tenantId = $this->tenant_id;
        } elseif ($this instanceof \App\Models\Business) {
            $tenantId = $this->id;
        } elseif (app()->bound('current_business_id')) {
            $tenantId = app('current_business_id');
        }

        return ActivityLog::create([
            'tenant_id' => $tenantId,
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->getKey(),
            'description' => $description,
            'properties' => $properties,
        ]);
    }
}
