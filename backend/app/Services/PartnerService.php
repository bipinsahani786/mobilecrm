<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\PartnerCreatedMail;

class PartnerService
{
    /**
     * Get paginated, filtered, and sorted partners list.
     */
    public function getPaginatedPartners(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Partner::withCount('businesses')
            ->filterByFields($filters, [
                'status',
            ])
            ->search($filters['search'] ?? null, [
                'name',
                'email',
                'company_name',
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
                ['created_at', 'name', 'email', 'status']
            )
            ->paginate($perPage);
    }

    /**
     * Create a new partner (by Superadmin).
     * Auto-creates a linked User account with the Partner role.
     */
    public function createPartner(array $data): Partner
    {
        if (empty($data['referral_code'])) {
            $data['referral_code'] = strtoupper(Str::random(8));
        }

        // Auto-create a user account for the partner
        $password = $data['password'] ?? Str::random(10);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($password),
        ]);

        // Assign Partner role
        setPermissionsTeamId(null);
        $user->assignRole('Partner');

        $data['user_id'] = $user->id;

        $partner = Partner::create($data);

        // Attach the generated password to the response (for Superadmin to share)
        $partner->generated_password = $password;

        // Send email to the partner
        Mail::to($data['email'])->send(new PartnerCreatedMail($data['name'], $data['email'], $password));

        return $partner;
    }

    /**
     * Self-register a new partner.
     * Called when a user signs up as a partner from the frontend.
     */
    public function selfRegister(array $data): array
    {
        // Check if email already exists
        if (User::where('email', $data['email'])->exists()) {
            throw new \Illuminate\Validation\ValidationException(
                \Illuminate\Support\Facades\Validator::make([], []),
                response()->json(['message' => 'An account with this email already exists.'], 422)
            );
        }

        // Create user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
        ]);

        setPermissionsTeamId(null);
        $user->assignRole('Partner');

        // Fetch default commission settings
        $settings = \Illuminate\Support\Facades\Cache::get('global_settings', []);
        $commissionType = $settings['partner_commission_type'] ?? 'percentage';
        $commissionValue = $settings['partner_commission_value'] ?? 10;

        // Create partner record
        $partner = Partner::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'referral_code' => strtoupper(Str::random(8)),
            'commission_type' => $commissionType,
            'commission_value' => (float) $commissionValue,
            'status' => true,
            'user_id' => $user->id,
        ]);

        // Generate auth token
        $user->load('roles');
        $userData = $user->toArray();
        $userData['permissions'] = $user->getAllPermissions()->pluck('name');

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $userData,
            'partner' => $partner,
            'token' => $token,
        ];
    }

    public function getPartnerDetails(int $id): Partner
    {
        return Partner::with(['businesses.plan'])->findOrFail($id);
    }

    /**
     * Get analytics and dashboard metrics for a partner.
     */
    public function getPartnerAnalytics(int $id): array
    {
        $partner = Partner::findOrFail($id);

        $totalLeads = $partner->leads()->count();
        $convertedLeads = $partner->leads()->where('status', 'converted')->count();
        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;
        
        $totalBusinesses = $partner->businesses()->count();

        // Commissions aggregations
        $totalRevenue = (float) $partner->commissions()->sum('amount_paid_by_tenant');
        $totalCommission = (float) $partner->commissions()->sum('commission_amount');
        $paidCommission = (float) $partner->commissions()->where('status', 'paid')->sum('commission_amount');
        $pendingCommission = (float) $partner->commissions()->where('status', 'pending')->sum('commission_amount');
        $cancelledCommission = (float) $partner->commissions()->where('status', 'cancelled')->sum('commission_amount');

        // Recent items
        $recentLeads = $partner->leads()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentCommissions = $partner->commissions()
            ->with(['business', 'plan'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'partner' => $partner,
            'metrics' => [
                'total_leads' => $totalLeads,
                'converted_leads' => $convertedLeads,
                'conversion_rate' => $conversionRate,
                'total_businesses' => $totalBusinesses,
                'total_referred_revenue' => $totalRevenue,
                'total_commission_earned' => $totalCommission,
                'paid_commission' => $paidCommission,
                'pending_commission' => $pendingCommission,
                'cancelled_commission' => $cancelledCommission,
            ],
            'recent_leads' => $recentLeads,
            'recent_commissions' => $recentCommissions,
        ];
    }

    /**
     * Update partner details.
     */
    public function updatePartner(int $id, array $data): Partner
    {
        $partner = Partner::findOrFail($id);
        $partner->update($data);

        // Update the linked user's password if provided
        if (!empty($data['password'])) {
            $user = User::find($partner->user_id);
            if ($user) {
                $user->update([
                    'password' => Hash::make($data['password']),
                ]);
            }
        }

        return $partner;
    }

    /**
     * Delete a partner.
     */
    public function deletePartner(int $id): void
    {
        $partner = Partner::findOrFail($id);
        $partner->delete();
    }
}

