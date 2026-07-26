<?php

namespace App\Services;

use App\Models\Business;
use App\Models\User;

class BusinessService
{
    /**
     * Get all businesses for a user
     */
    public function getBusinessesForUser(User $user)
    {
        return Business::with('plan')->where('owner_id', $user->id)
            ->orWhereHas('users', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->get();
    }

    /**
     * Create a new business and link to owner
     */
    public function createBusiness(User $owner, array $data): Business
    {
        $data['owner_id'] = $owner->id;

        // Check if owner already has a business with a plan
        $existingBusiness = Business::where('owner_id', $owner->id)->whereNotNull('plan_id')->first();
        
        if ($existingBusiness) {
            // Inherit the plan details from the existing business
            $data['plan_id'] = $existingBusiness->plan_id;
            $data['plan_expires_at'] = $existingBusiness->plan_expires_at;
            $data['custom_features'] = $existingBusiness->custom_features;
            $data['partner_id'] = $existingBusiness->partner_id;
        } else {
            // Assign default plan (e.g. Enterprise Trial) if none provided
            if (!isset($data['plan_id'])) {
                $data['plan_id'] = 4; // Assuming 4 is Enterprise
                $data['plan_expires_at'] = now()->addDays(14);
            }
        }

        $business = Business::create($data);
        
        // Ensure owner is attached as a user to the branch
        $business->users()->attach($owner->id);

        // Seed default payroll components
        $business->payrollComponents()->createMany([
            ['name' => 'Basic Salary', 'type' => 'earning', 'is_default' => true],
            ['name' => 'House Rent Allowance (HRA)', 'type' => 'earning', 'is_default' => true],
            ['name' => 'Other Allowances', 'type' => 'earning', 'is_default' => true],
            ['name' => 'General Deductions', 'type' => 'deduction', 'is_default' => true],
        ]);

        return $business;
    }

    /**
     * Update an existing business
     */
    public function updateBusiness(Business $business, array $data): Business
    {
        $business->update($data);
        return $business;
    }

    /**
     * Delete an existing business
     */
    public function deleteBusiness(Business $business): void
    {
        $business->delete();
    }
}
