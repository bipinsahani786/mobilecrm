<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\PayoutRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PayoutController extends BaseController
{
    /**
     * GET /superadmin/payouts
     * List all payout requests with filters.
     */
    #[OA\Get(
        path: '/superadmin/payouts',
        summary: 'List Payout Requests',
        description: 'Get a paginated list of all payout requests across all partners.',
        tags: ['Superadmin - Payouts'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Payout requests retrieved successfully')
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = PayoutRequest::with(['partner', 'approvedByUser']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('partner_id')) {
            $query->where('partner_id', $request->input('partner_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('partner', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $perPage = $request->input('per_page', 10);
        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return $this->paginated($paginator, 'Payout requests retrieved successfully');
    }

    /**
     * GET /superadmin/payouts/{id}
     * Get single payout request detail.
     */
    #[OA\Get(
        path: '/superadmin/payouts/{id}',
        summary: 'Payout Request Details',
        description: 'Get details of a single payout request.',
        tags: ['Superadmin - Payouts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Payout request retrieved successfully')
        ]
    )]
    public function show($id): JsonResponse
    {
        return $this->executeAction(function () use ($id) {
            return PayoutRequest::with(['partner', 'approvedByUser'])->findOrFail($id);
        }, 'Payout request retrieved successfully');
    }

    /**
     * PATCH /superadmin/payouts/{id}/approve
     * Approve a pending payout request.
     */
    #[OA\Patch(
        path: '/superadmin/payouts/{id}/approve',
        summary: 'Approve Payout Request',
        description: 'Approve a pending payout request and optionally add admin notes.',
        tags: ['Superadmin - Payouts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'admin_notes', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Payout request approved successfully')
        ]
    )]
    public function approve(Request $request, $id): JsonResponse
    {
        return $this->executeAction(function () use ($request, $id) {
            $payout = PayoutRequest::findOrFail($id);

            if ($payout->status !== 'pending') {
                throw new \Exception("Only pending requests can be approved. Current status: {$payout->status}");
            }

            $payout->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'admin_notes' => $request->input('admin_notes'),
            ]);

            return $payout->fresh(['partner', 'approvedByUser']);
        }, 'Payout request approved successfully');
    }

    /**
     * PATCH /superadmin/payouts/{id}/reject
     * Reject a pending payout request.
     */
    #[OA\Patch(
        path: '/superadmin/payouts/{id}/reject',
        summary: 'Reject Payout Request',
        description: 'Reject a pending payout request and optionally add admin notes.',
        tags: ['Superadmin - Payouts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'admin_notes', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Payout request rejected')
        ]
    )]
    public function reject(Request $request, $id): JsonResponse
    {
        return $this->executeAction(function () use ($request, $id) {
            $payout = PayoutRequest::findOrFail($id);

            if (!in_array($payout->status, ['pending', 'approved'])) {
                throw new \Exception("Only pending or approved requests can be rejected. Current status: {$payout->status}");
            }

            $payout->update([
                'status' => 'rejected',
                'admin_notes' => $request->input('admin_notes'),
            ]);

            return $payout->fresh(['partner']);
        }, 'Payout request rejected');
    }

    /**
     * PATCH /superadmin/payouts/{id}/paid
     * Mark an approved payout as paid with payment reference.
     */
    #[OA\Patch(
        path: '/superadmin/payouts/{id}/paid',
        summary: 'Mark Payout as Paid',
        description: 'Mark an approved payout request as paid by providing a payment reference (UTR).',
        tags: ['Superadmin - Payouts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['payment_reference'],
                properties: [
                    new OA\Property(property: 'payment_reference', type: 'string'),
                    new OA\Property(property: 'admin_notes', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Payout marked as paid successfully')
        ]
    )]
    public function markPaid(Request $request, $id): JsonResponse
    {
        return $this->executeAction(function () use ($request, $id) {
            $data = $request->validate([
                'payment_reference' => 'required|string|max:255',
                'admin_notes' => 'nullable|string|max:500',
            ]);

            $payout = PayoutRequest::findOrFail($id);

            if ($payout->status !== 'approved') {
                throw new \Exception("Only approved requests can be marked as paid. Current status: {$payout->status}");
            }

            $payout->update([
                'status' => 'paid',
                'paid_at' => now(),
                'payment_reference' => $data['payment_reference'],
                'admin_notes' => $data['admin_notes'] ?? $payout->admin_notes,
            ]);

            return $payout->fresh(['partner', 'approvedByUser']);
        }, 'Payout marked as paid successfully');
    }

    /**
     * GET /superadmin/payouts/stats
     * Summary stats for payout management.
     */
    #[OA\Get(
        path: '/superadmin/payouts/stats',
        summary: 'Payout Stats',
        description: 'Summary statistics for all payout requests.',
        tags: ['Superadmin - Payouts'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Payout stats retrieved successfully')
        ]
    )]
    public function stats(): JsonResponse
    {
        return $this->executeAction(function () {
            return [
                'total_requests' => PayoutRequest::count(),
                'pending' => PayoutRequest::where('status', 'pending')->count(),
                'approved' => PayoutRequest::where('status', 'approved')->count(),
                'paid' => PayoutRequest::where('status', 'paid')->count(),
                'rejected' => PayoutRequest::where('status', 'rejected')->count(),
                'total_paid_amount' => (float) PayoutRequest::where('status', 'paid')->sum('amount'),
                'total_pending_amount' => (float) PayoutRequest::whereIn('status', ['pending', 'approved'])->sum('amount'),
            ];
        }, 'Payout stats retrieved successfully');
    }
}
