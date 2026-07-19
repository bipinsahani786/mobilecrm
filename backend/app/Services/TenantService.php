<?php

namespace App\Services;

use App\Models\Business;
use App\Models\User;
use App\Models\Partner;
use App\Models\Plan;
use App\Models\Commission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Services\System\ActivityLogService;

class TenantService
{
    public function __construct(private ActivityLogService $activityLogService)
    {
    }
    /**
     * Get paginated, filtered, and sorted tenants list.
     */
    public function getPaginatedTenants(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Business::with(['owner:id,name,email', 'plan:id,name'])
            ->filterByFields($filters, [
                'status',
            ])
            ->search($filters['search'] ?? null, [
                'name',
                'email',
                'gst_number'
            ]);

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->sort(
                $filters['sort_by'] ?? null,
                $filters['sort_order'] ?? null,
                ['created_at', 'name', 'status']
            )
            ->paginate($perPage);
    }

    /**
     * Update status of a tenant.
     */
    public function updateStatus(int $id, string $status): Business
    {
        $business = Business::findOrFail($id);
        $business->status = $status;
        $business->save();
        return $business;
    }

    /**
     * Onboard a new tenant (User + Business + Plan + Commission).
     */
    public function onboardTenant(array $data): Business
    {
        // Check if user exists by email, if not create
        $user = User::where('email', $data['owner_email'])->first();

        if (!$user) {
            $user = User::create([
                'name' => $data['owner_name'],
                'email' => $data['owner_email'],
                'phone' => $data['owner_phone'] ?? null,
                'password' => Hash::make($data['owner_password']),
            ]);
        }

        // Create the Business
        $business = Business::create([
            'name' => $data['business_name'],
            'email' => $data['owner_email'],
            'phone' => $data['owner_phone'] ?? null,
            'owner_id' => $user->id,
            'plan_id' => $data['plan_id'] ?? null,
            'custom_features' => $data['custom_features'] ?? null,
            'partner_id' => $data['partner_id'] ?? null,
            'status' => 'active',
        ]);

        // Attach owner to business pivot
        $user->businesses()->attach($business->id);

        // Create and assign role scoped to this business
        setPermissionsTeamId($business->id);
        $businessAdminRole = \Spatie\Permission\Models\Role::firstOrCreate([
            'name' => 'Business Admin',
            'business_id' => $business->id,
            'guard_name' => 'web'
        ]);
        
        $businessPermissions = [
            'manage_sales', 'manage_inventory', 'manage_purchases',
            'manage_expenses', 'manage_customers', 'manage_suppliers',
            'manage_staff', 'manage_attendance', 'manage_payroll',
            'manage_business_settings',
        ];
        $businessAdminRole->syncPermissions($businessPermissions);
        
        $user->assignRole($businessAdminRole);

        // Generate Commission if partner and plan exist
        if (!empty($data['partner_id']) && !empty($data['plan_id'])) {
            $paymentCollectedBy = ($data['payment_method'] ?? 'online') === 'offline' ? 'partner' : 'system';
            $this->generateCommission($business, $data['partner_id'], $data['plan_id'], $data['amount_paid'] ?? 0, $paymentCollectedBy);
        }

        return $business->load(['owner', 'plan']);
    }

    /**
     * Update an existing tenant.
     */
    public function updateTenant(int $id, array $data): Business
    {
        $business = Business::findOrFail($id);
        $oldPlanId = $business->plan_id;
        $oldFeatures = $business->custom_features;
        
        $business->update($data);

        // Sync subscription fields across all branches owned by this user
        $subscriptionData = collect($data)->only(['plan_id', 'plan_expires_at', 'custom_features', 'partner_id'])->toArray();
        if (!empty($subscriptionData)) {
            Business::where('owner_id', $business->owner_id)
                ->where('id', '!=', $business->id)
                ->update($subscriptionData);
        }

        // Log the tenant update and feature changes
        if (isset($data['custom_features']) && $data['custom_features'] !== $oldFeatures) {
            $this->activityLogService->log(
                action: 'tenant_features_updated',
                modelType: Business::class,
                modelId: $business->id,
                description: "Superadmin updated custom features for tenant {$business->name}",
                properties: ['old' => $oldFeatures, 'new' => $data['custom_features']],
                tenantId: $business->id
            );
        }

        // Generate Commission if plan changed and partner exists
        if (!empty($data['plan_id']) && $data['plan_id'] != $oldPlanId && !empty($business->partner_id)) {
            $paymentCollectedBy = ($data['payment_method'] ?? 'online') === 'offline' ? 'partner' : 'system';
            $this->generateCommission($business, $business->partner_id, $data['plan_id'], $data['amount_paid'] ?? 0, $paymentCollectedBy);
        }

        return $business->load(['owner', 'plan']);
    }

    /**
     * Reset tenant owner password.
     */
    public function resetOwnerPassword(int $id, string $newPassword): void
    {
        $business = Business::with('owner')->findOrFail($id);
        if (!$business->owner) {
            throw new \Exception('Owner not found for this business.');
        }

        $business->owner->password = Hash::make($newPassword);
        $business->owner->save();
    }

    /**
     * Generate commission records for referral partners.
     */
    public function generateCommission(Business $business, int $partnerId, int $planId, float $amountPaid, string $paymentCollectedBy = 'system'): void
    {
        $partner = Partner::find($partnerId);
        $plan = Plan::find($planId);

        if (!$partner || !$plan) return;

        // If no amount is provided, use yearly price as a fallback estimate
        if ($amountPaid <= 0) {
            $amountPaid = $plan->price_yearly > 0 ? $plan->price_yearly : $plan->price_monthly;
        }

        $commissionAmount = 0;
        if ($partner->commission_type === 'percentage') {
            $commissionAmount = ($amountPaid * $partner->commission_value) / 100;
        } else {
            $commissionAmount = $partner->commission_value;
        }

        Commission::create([
            'partner_id' => $partner->id,
            'business_id' => $business->id,
            'plan_id' => $plan->id,
            'amount_paid_by_tenant' => $amountPaid,
            'commission_amount' => $commissionAmount,
            'status' => 'pending',
            'payment_collected_by' => $paymentCollectedBy,
        ]);
    }
}
