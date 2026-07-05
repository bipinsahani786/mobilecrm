<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Partner;
use App\Services\PartnerService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PartnerController extends BaseController
{
    protected $partnerService;

    /**
     * Inject the PartnerService dependency.
     */
    public function __construct(PartnerService $partnerService)
    {
        $this->partnerService = $partnerService;
    }

    #[OA\Get(
        path: '/superadmin/partners',
        summary: 'List Partners',
        description: 'Get a list of all partners with their business count.',
        tags: ['Superadmin - Partners'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index(Request $request)
    {
        // Support either returning all data (backward compatibility) or paginated data
        if ($request->input('all') === 'true' || $request->input('per_page') == -1) {
            $partners = Partner::withCount('businesses')->get();
            return $this->success($partners, 'Partners retrieved successfully');
        }

        $filters = $request->only(['status', 'search', 'sort_by', 'sort_order', 'from_date', 'to_date']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->partnerService->getPaginatedPartners($filters, $perPage);
        return $this->paginated($paginator, 'Partners retrieved successfully');
    }

    #[OA\Post(
        path: '/superadmin/partners',
        summary: 'Create Partner',
        description: 'Creates a new partner.',
        tags: ['Superadmin - Partners'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'commission_type', 'commission_value'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'company_name', type: 'string'),
                    new OA\Property(property: 'commission_type', type: 'string', enum: ['percentage', 'fixed']),
                    new OA\Property(property: 'commission_value', type: 'number'),
                    new OA\Property(property: 'is_recurring_commission', type: 'boolean'),
                    new OA\Property(property: 'custom_domain', type: 'string'),
                    new OA\Property(property: 'status', type: 'boolean')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Partner created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:partners',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'commission_type' => 'required|in:percentage,fixed',
            'commission_value' => 'required|numeric|min:0',
            'is_recurring_commission' => 'boolean',
            'custom_domain' => 'nullable|string|unique:partners,custom_domain',
            'payout_details' => 'nullable|array',
            'status' => 'boolean',
            'password' => 'nullable|string|min:8',
        ]);

        $partner = $this->partnerService->createPartner($validated);

        return $this->success($partner, 'Partner created successfully');
    }

    #[OA\Get(
        path: '/superadmin/partners/{id}',
        summary: 'Get Partner Details',
        description: 'Retrieves a single partner with their associated businesses and plans.',
        tags: ['Superadmin - Partners'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 404, description: 'Partner not found')
        ]
    )]
    public function show($id)
    {
        try {
            $partner = $this->partnerService->getPartnerDetails((int) $id);
            return $this->success($partner, 'Partner retrieved successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Partner not found.');
        }
    }

    #[OA\Get(
        path: '/superadmin/partners/{id}/analytics',
        summary: 'Get Partner Analytics',
        description: 'Retrieves metrics, conversion rates, commissions payouts, and recent referred history.',
        tags: ['Superadmin - Partners'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 404, description: 'Partner not found')
        ]
    )]
    public function analytics($id)
    {
        try {
            $analytics = $this->partnerService->getPartnerAnalytics((int) $id);
            return $this->success($analytics, 'Partner analytics retrieved successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Partner not found.');
        }
    }

    #[OA\Patch(
        path: '/superadmin/partners/{id}',
        summary: 'Update Partner',
        description: 'Updates an existing partner details.',
        tags: ['Superadmin - Partners'],
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
                    new OA\Property(property: 'company_name', type: 'string'),
                    new OA\Property(property: 'commission_type', type: 'string', enum: ['percentage', 'fixed']),
                    new OA\Property(property: 'commission_value', type: 'number'),
                    new OA\Property(property: 'is_recurring_commission', type: 'boolean'),
                    new OA\Property(property: 'custom_domain', type: 'string'),
                    new OA\Property(property: 'status', type: 'boolean')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Partner updated successfully')
        ]
    )]
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:partners,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'commission_type' => 'sometimes|required|in:percentage,fixed',
            'commission_value' => 'sometimes|required|numeric|min:0',
            'is_recurring_commission' => 'boolean',
            'custom_domain' => 'nullable|string|unique:partners,custom_domain,' . $id,
            'payout_details' => 'nullable|array',
            'status' => 'boolean',
            'password' => 'nullable|string|min:8',
        ]);

        try {
            $partner = $this->partnerService->updatePartner((int) $id, $validated);
            return $this->success($partner, 'Partner updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Partner not found.');
        }
    }

    #[OA\Delete(
        path: '/superadmin/partners/{id}',
        summary: 'Delete Partner',
        description: 'Deletes a partner from the system.',
        tags: ['Superadmin - Partners'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Partner deleted successfully')
        ]
    )]
    public function destroy($id)
    {
        try {
            $this->partnerService->deletePartner((int) $id);
            return $this->success(null, 'Partner deleted successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Partner not found.');
        }
    }
}
