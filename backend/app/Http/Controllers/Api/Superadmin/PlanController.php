<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Plan;
use App\Services\PlanService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PlanController extends BaseController
{
    protected $planService;

    /**
     * Inject the PlanService dependency.
     */
    public function __construct(PlanService $planService)
    {
        $this->planService = $planService;
    }

    #[OA\Get(
        path: '/superadmin/plans',
        summary: 'List Subscription Plans',
        description: 'Get a list of all plans with optional status, search, and sorting filters.',
        tags: ['Superadmin - Plans'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index(Request $request)
    {
        // Support either returning all data (backward compatibility) or paginated data
        if ($request->input('all') === 'true' || $request->input('per_page') == -1) {
            $plans = Plan::withCount('businesses')->orderBy('price_monthly', 'asc')->get();
            return $this->success($plans, 'Plans retrieved successfully');
        }

        $filters = $request->only(['is_active', 'search', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 10);

        $paginator = $this->planService->getPaginatedPlans($filters, $perPage);
        return $this->paginated($paginator, 'Plans retrieved successfully');
    }

    #[OA\Post(
        path: '/superadmin/plans',
        summary: 'Create Subscription Plan',
        description: 'Creates a new subscription plan with name, price, and features list.',
        tags: ['Superadmin - Plans'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'price_monthly', 'price_yearly'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'price_monthly', type: 'number'),
                    new OA\Property(property: 'price_yearly', type: 'number'),
                    new OA\Property(property: 'features', type: 'array', items: new OA\Items(type: 'string')),
                    new OA\Property(property: 'is_active', type: 'boolean')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Plan created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $plan = $this->planService->createPlan($validated);

        return $this->created($plan, 'Plan created successfully.');
    }

    #[OA\Patch(
        path: '/superadmin/plans/{id}',
        summary: 'Update Subscription Plan',
        description: 'Updates plan configuration and toggles features.',
        tags: ['Superadmin - Plans'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'price_monthly', type: 'number'),
                    new OA\Property(property: 'price_yearly', type: 'number'),
                    new OA\Property(property: 'features', type: 'array', items: new OA\Items(type: 'string')),
                    new OA\Property(property: 'is_active', type: 'boolean')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Plan updated successfully'),
            new OA\Response(response: 404, description: 'Plan not found')
        ]
    )]
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'sometimes|required|numeric|min:0',
            'price_yearly' => 'sometimes|required|numeric|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        try {
            $plan = $this->planService->updatePlan((int) $id, $validated);
            return $this->success($plan, 'Plan updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Plan not found.');
        }
    }

    #[OA\Delete(
        path: '/superadmin/plans/{id}',
        summary: 'Delete Subscription Plan',
        description: 'Deletes a plan. Fails if the plan has active businesses attached.',
        tags: ['Superadmin - Plans'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Plan deleted successfully'),
            new OA\Response(response: 400, description: 'Cannot delete plan due to constraints'),
            new OA\Response(response: 404, description: 'Plan not found')
        ]
    )]
    public function destroy($id)
    {
        try {
            $this->planService->deletePlan((int) $id);
            return $this->success(null, 'Plan deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Plan not found.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
