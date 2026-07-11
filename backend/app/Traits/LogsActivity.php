<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log an activity for the model.
     */
    public function logActivity(string $action, ?string $description = null, ?array $properties = null): ActivityLog
    {
        $tenantId = null;
        if (property_exists($this, 'tenant_id')) {
            $tenantId = $this->tenant_id;
        } elseif ($this instanceof \App\Models\Business) {
            $tenantId = $this->id;
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
