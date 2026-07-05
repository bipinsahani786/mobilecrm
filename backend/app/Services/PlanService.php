<?php

namespace App\Services;

use App\Models\Plan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PlanService
{
    /**
     * Get paginated, filtered, and sorted plans list.
     */
    public function getPaginatedPlans(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Plan::withCount('businesses')
            ->filterByFields($filters, [
                'is_active',
            ])
            ->search($filters['search'] ?? null, [
                'name',
                'description',
            ])
            ->sort(
                $filters['sort_by'] ?? null,
                $filters['sort_order'] ?? null,
                ['created_at', 'name', 'price_monthly', 'price_yearly', 'is_active'],
                'price_monthly',
                'asc'
            )
            ->paginate($perPage);
    }

    /**
     * Create a new plan.
     */
    public function createPlan(array $data): Plan
    {
        return Plan::create($data);
    }

    /**
     * Update an existing plan.
     */
    public function updatePlan(int $id, array $data): Plan
    {
        $plan = Plan::findOrFail($id);
        $plan->update($data);
        return $plan;
    }

    /**
     * Delete a plan.
     */
    public function deletePlan(int $id): void
    {
        $plan = Plan::findOrFail($id);

        if ($plan->businesses()->exists()) {
            throw new \Exception('Cannot delete plan because it has active businesses attached.');
        }

        $plan->delete();
    }
}
