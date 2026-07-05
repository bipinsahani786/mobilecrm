<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Business;
use App\Services\TenantService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TenantController extends BaseController
{
    protected $tenantService;

    /**
     * Inject the TenantService dependency.
     */
    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    #[OA\Get(
        path: '/superadmin/businesses',
        summary: 'List Tenant Businesses',
        description: 'Get a list of all onboarded businesses with optional status, search, and sorting filters.',
        tags: ['Superadmin - Tenants'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index(Request $request)
    {
        // Support either returning all data (backward compatibility) or paginated data
        if ($request->input('all') === 'true' || $request->input('per_page') == -1) {
            $businesses = Business::with(['owner:id,name,email', 'plan:id,name'])
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->success($businesses, 'Tenants retrieved successfully');
        }

        $filters = $request->only(['status', 'search', 'sort_by', 'sort_order', 'from_date', 'to_date']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->tenantService->getPaginatedTenants($filters, $perPage);
        return $this->paginated($paginator, 'Tenants retrieved successfully');
    }

    #[OA\Patch(
        path: '/superadmin/businesses/{id}/status',
        summary: 'Update Tenant Business Status',
        description: 'Suspends or activates a business tenant.',
        tags: ['Superadmin - Tenants'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['status'],
                properties: [
                    new OA\Property(property: 'status', type: 'string', enum: ['active', 'suspended'])
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Business status updated successfully'),
            new OA\Response(response: 404, description: 'Business not found')
        ]
    )]
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,suspended'
        ]);

        try {
            $business = $this->tenantService->updateStatus((int) $id, $request->status);
            return $this->success([
                'business' => $business
            ], 'Business status updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Business not found.');
        }
    }

    #[OA\Post(
        path: '/superadmin/businesses/onboard',
        summary: 'Onboard New Tenant Business',
        description: 'Creates a new user account, registers their business, and assigns subscription plans.',
        tags: ['Superadmin - Tenants'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['owner_name', 'owner_email', 'owner_password', 'business_name'],
                properties: [
                    new OA\Property(property: 'owner_name', type: 'string'),
                    new OA\Property(property: 'owner_email', type: 'string'),
                    new OA\Property(property: 'owner_phone', type: 'string'),
                    new OA\Property(property: 'owner_password', type: 'string'),
                    new OA\Property(property: 'business_name', type: 'string'),
                    new OA\Property(property: 'plan_id', type: 'integer'),
                    new OA\Property(property: 'custom_features', type: 'object'),
                    new OA\Property(property: 'partner_id', type: 'integer'),
                    new OA\Property(property: 'amount_paid', type: 'number')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Tenant onboarded successfully')
        ]
    )]
    public function onboard(Request $request)
    {
        $validated = $request->validate([
            // Owner Details
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',
            'owner_phone' => 'nullable|string|max:20',
            'owner_password' => 'required|string|min:8',
            
            // Business Details
            'business_name' => 'required|string|max:255',
            'plan_id' => 'nullable|exists:plans,id',
            'custom_features' => 'nullable|array',
            'partner_id' => 'nullable|exists:partners,id',
            'amount_paid' => 'nullable|numeric|min:0',
        ]);

        $business = $this->tenantService->onboardTenant($validated);

        return $this->created($business, 'Tenant onboarded successfully.');
    }

    #[OA\Patch(
        path: '/superadmin/businesses/{id}',
        summary: 'Update Tenant Details',
        description: 'Updates business details, associated subscription plan, features, and partner referral.',
        tags: ['Superadmin - Tenants'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'gst_number', type: 'string'),
                    new OA\Property(property: 'plan_id', type: 'integer'),
                    new OA\Property(property: 'custom_features', type: 'object'),
                    new OA\Property(property: 'plan_expires_at', type: 'string', format: 'date-time'),
                    new OA\Property(property: 'partner_id', type: 'integer'),
                    new OA\Property(property: 'amount_paid', type: 'number')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Tenant updated successfully'),
            new OA\Response(response: 404, description: 'Business not found')
        ]
    )]
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'gst_number' => 'nullable|string|max:15',
            'plan_id' => 'nullable|exists:plans,id',
            'custom_features' => 'nullable|array',
            'plan_expires_at' => 'nullable|date',
            'partner_id' => 'nullable|exists:partners,id',
            'amount_paid' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:active,suspended',
        ]);

        try {
            $business = $this->tenantService->updateTenant((int) $id, $validated);
            return $this->success($business, 'Tenant updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Business not found.');
        }
    }

    #[OA\Patch(
        path: '/superadmin/businesses/{id}/password',
        summary: 'Reset Tenant Owner Password',
        description: 'Resets the login password for the business owner.',
        tags: ['Superadmin - Tenants'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['new_password'],
                properties: [
                    new OA\Property(property: 'new_password', type: 'string')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Owner password reset successfully'),
            new OA\Response(response: 404, description: 'Business or Owner not found')
        ]
    )]
    public function resetPassword(Request $request, $id)
    {
        $validated = $request->validate([
            'new_password' => 'required|string|min:8',
        ]);

        try {
            $this->tenantService->resetOwnerPassword((int) $id, $validated['new_password']);
            return $this->success(null, 'Owner password reset successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Business or Owner not found.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
