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
        return Business::where('owner_id', $user->id)
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
        $business = Business::create($data);
        
        // Ensure owner is attached as a user to the branch
        $business->users()->attach($owner->id);

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
