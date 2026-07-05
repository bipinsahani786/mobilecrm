<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\PayoutRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PartnerPortalService
{
    /**
     * Get dashboard statistics for the partner.
     */
    public function getDashboardStats(Partner $partner): array
    {
        $totalReferrals = $partner->businesses()->count();
        $activeBusinesses = $partner->businesses()->where('status', 'active')->count();

        $totalLeads = $partner->leads()->count();
        $convertedLeads = $partner->leads()->where('status', 'converted')->count();
        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;

        // Commission aggregates
        $totalEarned = (float) $partner->commissions()->sum('commission_amount');
        $paidAmount = (float) $partner->commissions()->where('status', 'paid')->sum('commission_amount');
        $pendingAmount = (float) $partner->commissions()->where('status', 'pending')->where('payment_collected_by', 'system')->sum('commission_amount');

        // Calculate Platform Dues (Cash collected offline by partner)
        // Pending Dues
        $platformDues = (float) $partner->commissions()
            ->where('status', 'pending')
            ->where('payment_collected_by', 'partner')
            ->sum(DB::raw('amount_paid_by_tenant - commission_amount'));

        // Settled/Paid Dues (Amount Partner has already transferred to Superadmin)
        $totalDuesPaid = (float) $partner->commissions()
            ->where('status', 'paid')
            ->where('payment_collected_by', 'partner')
            ->sum(DB::raw('amount_paid_by_tenant - commission_amount'));

        $netAvailableBalance = $pendingAmount - $platformDues;

        // Monthly earnings for chart (last 12 months)
        $monthlyEarnings = $partner->commissions()
            ->where('created_at', '>=', now()->subMonths(12))
            ->get()
            ->groupBy(function ($item) {
                return $item->created_at->format('Y-m');
            })
            ->map(function ($items, $month) {
                return [
                    'month' => $month,
                    'total' => (float) $items->sum('commission_amount'),
                ];
            })
            ->sortBy('month')
            ->values()
            ->toArray();

        // Recent referrals
        $recentReferrals = $partner->businesses()
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Recent commissions
        $recentCommissions = $partner->commissions()
            ->with(['business', 'plan'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'total_referrals' => $totalReferrals,
            'active_businesses' => $activeBusinesses,
            'total_leads' => $totalLeads,
            'conversion_rate' => $conversionRate,
            'total_earned' => $totalEarned,
            'paid_amount' => $paidAmount,
            'pending_amount' => $pendingAmount,
            'platform_dues' => $platformDues,
            'total_dues_paid' => $totalDuesPaid,
            'net_available_balance' => $netAvailableBalance,
            'stats' => [
                'total_referrals' => $totalReferrals,
                'active_businesses' => $activeBusinesses,
                'total_earned' => $totalEarned,
                'paid_amount' => $paidAmount,
                'pending_amount' => $pendingAmount,
                'available_payout' => $partner->getAvailablePayoutAmount(),
                'platform_dues' => $platformDues,
                'total_dues_paid' => $totalDuesPaid,
                'net_available_balance' => $netAvailableBalance,
                'total_leads' => $totalLeads,
                'converted_leads' => $convertedLeads,
                'conversion_rate' => $conversionRate,
            ],
            'monthly_earnings' => $monthlyEarnings,
            'recent_referrals' => $recentReferrals,
            'recent_commissions' => $recentCommissions,
        ];
    }

    /**
     * Get paginated referrals (businesses) for the partner.
     */
    public function getMyReferrals(Partner $partner, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $partner->businesses()->with(['plan', 'owner']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('businesses.created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('businesses.created_at', '<=', $filters['to_date']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $allowedSorts = ['created_at', 'name', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get a single referral detail (must belong to partner).
     */
    public function getReferralDetail(Partner $partner, int $businessId): array
    {
        $business = $partner->businesses()
            ->with(['plan', 'owner'])
            ->findOrFail($businessId);

        $commissions = $partner->commissions()
            ->where('business_id', $businessId)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalCommission = $commissions->sum('commission_amount');

        return [
            'business' => $business,
            'commissions' => $commissions,
            'total_commission' => (float) $totalCommission,
        ];
    }

    /**
     * Get paginated commissions for the partner.
     */
    public function getMyCommissions(Partner $partner, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $partner->commissions()->with(['business', 'plan']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('commissions.created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('commissions.created_at', '<=', $filters['to_date']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $allowedSorts = ['created_at', 'commission_amount', 'amount_paid_by_tenant', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a payout request for the partner.
     */
    public function createPayoutRequest(Partner $partner, array $data): PayoutRequest
    {
        $available = $partner->getAvailablePayoutAmount();

        if ($data['amount'] > $available) {
            throw new \Exception("Requested amount (₹{$data['amount']}) exceeds available balance (₹{$available}).");
        }

        if ($data['amount'] <= 0) {
            throw new \Exception('Payout amount must be greater than zero.');
        }

        return $partner->payoutRequests()->create([
            'amount' => $data['amount'],
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
        ]);
    }

    /**
     * Get paginated payout requests for the partner.
     */
    public function getMyPayouts(Partner $partner, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $partner->payoutRequests();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Update partner profile details.
     */
    public function updateProfile(Partner $partner, array $data): Partner
    {
        $allowedFields = ['name', 'phone', 'company_name'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));
        $partner->update($updateData);

        // Update linked user's name if changed
        if (isset($data['name']) && $partner->user) {
            $partner->user->update(['name' => $data['name']]);
        }

        return $partner->fresh();
    }

    /**
     * Update partner payout details (bank, UPI, etc.).
     */
    public function updatePayoutDetails(Partner $partner, array $data): Partner
    {
        $partner->update(['payout_details' => $data]);
        return $partner->fresh();
    }

    /**
     * Get referral link data for the partner.
     */
    public function getReferralLinkData(Partner $partner): array
    {
        $baseUrl = config('app.frontend_url', config('app.url'));
        $referralLink = rtrim($baseUrl, '/') . '/register?ref=' . $partner->referral_code;

        return [
            'referral_code' => $partner->referral_code,
            'referral_link' => $referralLink,
        ];
    }
}
