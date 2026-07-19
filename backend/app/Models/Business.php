<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, Filterable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'gst_number',
        'address',
        'logo_path',
        'owner_id',
        'phone_2',
        'pincode',
        'state',
        'description',
        'business_type',
        'business_category',
        'books_opening_date',
        'signature_path',
        'card_preferences',
        'status',
        'plan_id',
        'custom_features',
        'plan_expires_at',
        'partner_id',
        'settings',
    ];

    protected $casts = [
        'card_preferences' => 'array',
        'books_opening_date' => 'date',
        'custom_features' => 'array',
        'plan_expires_at' => 'datetime',
        'settings' => 'array',
    ];

    /**
     * Get the owner of the business.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * Check if the business has a specific feature enabled.
     * Checks custom_features override first, then falls back to the Plan's features.
     */
    public function hasFeature(string $featureKey): bool
    {
        $customFeatures = $this->custom_features ?? [];

        // If explicitly set (true/false) in custom features, respect that
        if (array_key_exists($featureKey, $customFeatures)) {
            return (bool) $customFeatures[$featureKey];
        }

        // Fallback to plan features
        if ($this->plan && is_array($this->plan->features)) {
            return !empty($this->plan->features[$featureKey]);
        }

        return false;
    }

    /**
     * Get the users (staff) that belong to this business.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Get the payroll components for this business.
     */
    public function payrollComponents()
    {
        return $this->hasMany(PayrollComponent::class);
    }
}
