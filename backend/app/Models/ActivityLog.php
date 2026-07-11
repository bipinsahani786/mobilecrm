<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    /**
     * Get the tenant/business associated with the log.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'tenant_id');
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the target model.
     */
    public function target(): MorphTo
    {
        return $this->morphTo('model');
    }
}
