<?php

namespace App\Services;

use App\Models\Commission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommissionService
{
    /**
     * Get paginated, filtered, and sorted commissions list.
     */
    public function getPaginatedCommissions(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Commission::with(['partner', 'business', 'plan'])
            ->filterByFields($filters, [
                'status',
                'partner_id',
            ])
            ->search($filters['search'] ?? null, [
                'partner.name',
                'business.name',
                'plan.name',
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
                ['created_at', 'amount_paid_by_tenant', 'commission_amount', 'status']
            )
            ->paginate($perPage);
    }

    /**
     * Get commission details.
     */
    public function getCommissionDetails(int $id): Commission
    {
        return Commission::with(['partner', 'business', 'plan'])->findOrFail($id);
    }

    /**
     * Mark a pending commission as paid.
     */
    public function markCommissionAsPaid(int $id): Commission
    {
        $commission = Commission::findOrFail($id);

        if ($commission->status === 'paid') {
            throw new \Exception('Commission is already paid.');
        }

        $commission->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return $commission;
    }
}
