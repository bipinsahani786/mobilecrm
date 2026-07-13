<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\EmiDetail;
use App\Services\Business\FinanceService;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Business - Finance', description: 'API Endpoints for Managing EMI Finance Ledger')]
class FinanceController extends BaseController
{
    public function __construct(private FinanceService $financeService)
    {
    }

    #[OA\Get(
        path: '/business/finance/pending',
        summary: 'List Pending Payouts',
        description: 'Get a paginated list of pending EMI payouts.',
        tags: ['Business - Finance'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function pending(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 15);
            $search = $request->input('search');
            $financier = $request->input('financier');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $paginator = $this->financeService->getPendingPayouts($perPage, $search, $financier, $startDate, $endDate);
            return $this->paginated($paginator, 'Pending payouts retrieved');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Get(
        path: '/business/finance/completed',
        summary: 'List Completed Payouts',
        description: 'Get a paginated list of completed EMI payouts.',
        tags: ['Business - Finance'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function completed(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 15);
            $search = $request->input('search');
            $financier = $request->input('financier');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $paginator = $this->financeService->getCompletedPayouts($perPage, $search, $financier, $startDate, $endDate);
            return $this->paginated($paginator, 'Completed payouts retrieved');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Post(
        path: '/business/finance/{id}/mark-received',
        summary: 'Mark Payout as Received',
        description: 'Mark a pending EMI payout as received.',
        tags: ['Business - Finance'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'payout_date', type: 'string', format: 'date', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Payout marked as received')
        ]
    )]
    public function markReceived(Request $request, $id)
    {
        return $this->executeAction(function () use ($request, $id) {
            $emiDetail = EmiDetail::with('sale')->findOrFail($id);
            $date = $request->input('payout_date');
            return $this->financeService->markPayoutReceived($emiDetail, $date);
        }, 'Payout marked as received');
    }
}
