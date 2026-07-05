<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Controllers\BaseController;
use App\Services\PartnerPortalService;
use App\Services\PartnerService;
use App\Services\TenantService;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class PartnerPortalController extends BaseController
{
    protected PartnerPortalService $portalService;
    protected PartnerService $partnerService;

    public function __construct(PartnerPortalService $portalService, PartnerService $partnerService)
    {
        $this->portalService = $portalService;
        $this->partnerService = $partnerService;
    }

    /**
     * Get the authenticated partner's record.
     */
    private function getPartner(Request $request)
    {
        return $request->user()->partner;
    }

    /**
     * POST /partner/register (public)
     * Self-register as a new partner.
     */
    #[OA\Post(
        path: '/partner/register',
        summary: 'Partner Self-Registration',
        description: 'Allows a new partner to self-register publically.',
        tags: ['Partner Portal'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation', 'verification_token'],
                properties: [
                    new OA\Property(property: 'verification_token', type: 'string'),
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'company_name', type: 'string'),
                    new OA\Property(property: 'password', type: 'string'),
                    new OA\Property(property: 'password_confirmation', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Partner registration successful')
        ]
    )]
    public function register(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:8|confirmed',
                'company_name' => 'nullable|string|max:255',
                'verification_token' => 'required|string',
            ]);

            $verifiedEmail = \Illuminate\Support\Facades\Cache::get('verified_token_' . $data['verification_token']);

            if (!$verifiedEmail || $verifiedEmail !== $data['email']) {
                throw new \Exception('Invalid or expired verification token. Please verify your email again.');
            }

            \Illuminate\Support\Facades\Cache::forget('verified_token_' . $data['verification_token']);

            return $this->partnerService->selfRegister($data);
        }, 'Partner registration successful');
    }

    /**
     * GET /partner/dashboard
     * Dashboard stats, monthly earnings chart, recent activity.
     */
    #[OA\Get(
        path: '/partner/dashboard',
        summary: 'Partner Dashboard Stats',
        description: 'Get metrics and recent activity for the partner dashboard.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Dashboard stats retrieved successfully')
        ]
    )]
    public function dashboard(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $partner = $this->getPartner($request);
            return $this->portalService->getDashboardStats($partner);
        }, 'Dashboard stats retrieved successfully');
    }

    /**
     * GET /partner/referrals
     * Paginated list of referred businesses.
     */
    #[OA\Get(
        path: '/partner/referrals',
        summary: 'List Partner Referrals',
        description: 'Get paginated list of referred businesses for the logged-in partner.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Referrals retrieved successfully')
        ]
    )]
    public function referrals(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);
        $filters = $request->only(['search', 'status', 'from_date', 'to_date', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->portalService->getMyReferrals($partner, $filters, $perPage);
        return $this->paginated($paginator, 'Referrals retrieved successfully');
    }

    /**
     * GET /partner/referrals/{id}
     * Single referral detail with commission history.
     */
    #[OA\Get(
        path: '/partner/referrals/{id}',
        summary: 'Referral Details',
        description: 'Get details of a specific referral including their commission history.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Referral detail retrieved successfully')
        ]
    )]
    public function referralDetail(Request $request, $id): JsonResponse
    {
        return $this->executeAction(function () use ($request, $id) {
            $partner = $this->getPartner($request);
            return $this->portalService->getReferralDetail($partner, (int) $id);
        }, 'Referral detail retrieved successfully');
    }

    /**
     * GET /partner/referral-link
     * Get referral link and code.
     */
    #[OA\Get(
        path: '/partner/referral-link',
        summary: 'Get Referral Link',
        description: 'Get the unique referral link and code for the logged-in partner.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Referral link retrieved successfully')
        ]
    )]
    public function referralLink(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $partner = $this->getPartner($request);
            return $this->portalService->getReferralLinkData($partner);
        }, 'Referral link retrieved successfully');
    }

    /**
     * GET /partner/commissions
     * Paginated list of commissions.
     */
    #[OA\Get(
        path: '/partner/commissions',
        summary: 'List Partner Commissions',
        description: 'Get paginated list of commissions for the logged-in partner.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Commissions retrieved successfully')
        ]
    )]
    public function commissions(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);
        $filters = $request->only(['status', 'from_date', 'to_date', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->portalService->getMyCommissions($partner, $filters, $perPage);
        return $this->paginated($paginator, 'Commissions retrieved successfully');
    }

    /**
     * GET /partner/commissions/stats
     * Commission summary stats.
     */
    #[OA\Get(
        path: '/partner/commissions/stats',
        summary: 'Commission Stats',
        description: 'Get total, pending, and paid commission stats for the logged-in partner.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Commission stats retrieved successfully')
        ]
    )]
    public function commissionStats(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $partner = $this->getPartner($request);
            $totalEarned = (float) $partner->commissions()->sum('commission_amount');
            $paid = (float) $partner->commissions()->where('status', 'paid')->sum('commission_amount');
            $pending = (float) $partner->commissions()->where('status', 'pending')->sum('commission_amount');

            return [
                'total_earned' => $totalEarned,
                'paid' => $paid,
                'pending' => $pending,
            ];
        }, 'Commission stats retrieved successfully');
    }

    /**
     * GET /partner/payouts
     * Paginated list of payout requests.
     */
    #[OA\Get(
        path: '/partner/payouts',
        summary: 'List Partner Payout Requests',
        description: 'Get paginated list of payout requests for the logged-in partner.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Payouts retrieved successfully')
        ]
    )]
    public function payouts(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);
        $filters = $request->only(['status', 'from_date', 'to_date']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->portalService->getMyPayouts($partner, $filters, $perPage);
        return $this->paginated($paginator, 'Payouts retrieved successfully');
    }

    /**
     * POST /partner/payouts
     * Create a new payout request.
     */
    #[OA\Post(
        path: '/partner/payouts',
        summary: 'Create Payout Request',
        description: 'Create a new payout request to withdraw available funds.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['amount'],
                properties: [
                    new OA\Property(property: 'amount', type: 'number'),
                    new OA\Property(property: 'notes', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Payout request created successfully')
        ]
    )]
    public function createPayout(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $data = $request->validate([
                'amount' => 'required|numeric|min:1',
                'notes' => 'nullable|string|max:500',
            ]);

            $partner = $this->getPartner($request);
            return $this->portalService->createPayoutRequest($partner, $data);
        }, 'Payout request created successfully');
    }

    /**
     * GET /partner/profile
     * Get partner profile info.
     */
    #[OA\Get(
        path: '/partner/profile',
        summary: 'Get Partner Profile',
        description: 'Get the partner profile and payout details.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Profile retrieved successfully')
        ]
    )]
    public function profile(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $partner = $this->getPartner($request);
            $partner->load('user');
            return $partner;
        }, 'Profile retrieved successfully');
    }

    /**
     * PATCH /partner/profile
     * Update partner profile.
     */
    #[OA\Patch(
        path: '/partner/profile',
        summary: 'Update Partner Profile',
        description: 'Update partner general profile information.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'company_name', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Profile updated successfully')
        ]
    )]
    public function updateProfile(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'company_name' => 'nullable|string|max:255',
            ]);

            $partner = $this->getPartner($request);
            return $this->portalService->updateProfile($partner, $data);
        }, 'Profile updated successfully');
    }

    /**
     * PATCH /partner/payout-details
     * Update bank/UPI payout details.
     */
    #[OA\Patch(
        path: '/partner/payout-details',
        summary: 'Update Payout Details',
        description: 'Update partner bank or UPI details for receiving payouts.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'bank_name', type: 'string'),
                    new OA\Property(property: 'account_number', type: 'string'),
                    new OA\Property(property: 'ifsc_code', type: 'string'),
                    new OA\Property(property: 'account_holder_name', type: 'string'),
                    new OA\Property(property: 'upi_id', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Payout details updated successfully')
        ]
    )]
    public function updatePayoutDetails(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $data = $request->validate([
                'bank_name' => 'nullable|string|max:255',
                'account_number' => 'nullable|string|max:50',
                'ifsc_code' => 'nullable|string|max:20',
                'account_holder_name' => 'nullable|string|max:255',
                'upi_id' => 'nullable|string|max:255',
            ]);

            $partner = $this->getPartner($request);
            return $this->portalService->updatePayoutDetails($partner, $data);
        }, 'Payout details updated successfully');
    }

    /**
     * POST /partner/change-password
     * Change partner's login password.
     */
    #[OA\Post(
        path: '/partner/change-password',
        summary: 'Change Password',
        description: 'Change the password of the logged-in partner user.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['current_password', 'new_password', 'new_password_confirmation'],
                properties: [
                    new OA\Property(property: 'current_password', type: 'string'),
                    new OA\Property(property: 'new_password', type: 'string'),
                    new OA\Property(property: 'new_password_confirmation', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password changed successfully')
        ]
    )]
    public function changePassword(Request $request): JsonResponse
    {
        return $this->executeAction(function () use ($request) {
            $data = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $user = $request->user();

            if (!Hash::check($data['current_password'], $user->password)) {
                throw new \Exception('Current password is incorrect.');
            }

            $user->update(['password' => Hash::make($data['new_password'])]);

            return null;
        }, 'Password changed successfully');
    }

    /**
     * GET /partner/plans
     * List active subscription plans.
     */
    #[OA\Get(
        path: '/partner/plans',
        summary: 'List Active Plans',
        description: 'Get all active subscription plans for onboarding clients.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Plans retrieved successfully')
        ]
    )]
    public function plans(Request $request): JsonResponse
    {
        return $this->executeAction(function () {
            return Plan::where('is_active', true)->orderBy('price_monthly', 'asc')->get();
        }, 'Plans retrieved successfully');
    }

    /**
     * POST /partner/clients/onboard
     * Onboard a new client directly from the partner portal.
     */
    #[OA\Post(
        path: '/partner/clients/onboard',
        summary: 'Onboard New Client',
        description: 'Allows a partner to onboard a new business directly.',
        tags: ['Partner Portal'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['owner_name', 'owner_email', 'owner_password', 'business_name', 'payment_method'],
                properties: [
                    new OA\Property(property: 'owner_name', type: 'string'),
                    new OA\Property(property: 'owner_email', type: 'string'),
                    new OA\Property(property: 'owner_password', type: 'string'),
                    new OA\Property(property: 'business_name', type: 'string'),
                    new OA\Property(property: 'plan_id', type: 'integer'),
                    new OA\Property(property: 'payment_method', type: 'string', enum: ['online', 'offline']),
                    new OA\Property(property: 'amount_paid', type: 'number')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Client onboarded successfully')
        ]
    )]
    public function onboardClient(Request $request, TenantService $tenantService): JsonResponse
    {
        return $this->executeAction(function () use ($request, $tenantService) {
            $validated = $request->validate([
                'owner_name' => 'required|string|max:255',
                'owner_email' => 'required|email|max:255',
                'owner_password' => 'required|string|min:8',
                'business_name' => 'required|string|max:255',
                'plan_id' => 'nullable|exists:plans,id',
                'payment_method' => 'required|in:online,offline',
                'amount_paid' => 'nullable|numeric|min:0',
            ]);

            $partner = $this->getPartner($request);
            $validated['partner_id'] = $partner->id;

            // Handle hybrid payment logic
            if ($validated['payment_method'] === 'online') {
                $validated['amount_paid'] = 0;
            }

            $business = $tenantService->onboardTenant($validated);

            return $business;
        }, 'Client onboarded successfully', 201);
    }
}
