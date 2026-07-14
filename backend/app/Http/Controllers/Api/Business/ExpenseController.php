<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\Expense;
use App\Http\Requests\ExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Services\Business\ExpenseService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Business - Expenses', description: 'API Endpoints for Managing Business Expenses')]
class ExpenseController extends BaseController
{
    public function __construct(private ExpenseService $expenseService)
    {
    }

    #[OA\Get(
        path: '/business/expenses',
        summary: 'List Expenses',
        description: 'Get a paginated list of expenses for the current business.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 15);
            $search = $request->input('search');
            $category = $request->input('category');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $paginator = $this->expenseService->getExpenses($perPage, $search, $category, $startDate, $endDate);
            
            // Format with resource collection manually to use our standard paginated response
            $resourceCollection = ExpenseResource::collection($paginator);
            $data = $resourceCollection->response()->getData(true);
            
            return response()->json([
                'success' => true,
                'message' => 'Expenses retrieved successfully',
                'data' => collect($data['data']),
                'meta' => $data['meta'],
                'links' => $data['links']
            ]);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Get(
        path: '/business/expenses/categories',
        summary: 'List Expense Categories',
        description: 'Get a list of all expense categories for the current business.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function categories()
    {
        try {
            $categories = \App\Models\ExpenseCategory::select('id', 'name')->orderBy('name')->get();
            return $this->success($categories, 'Categories retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Post(
        path: '/business/expenses',
        summary: 'Create Expense',
        description: 'Record a new business expense.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['category', 'amount', 'expense_date'],
                    properties: [
                        new OA\Property(property: 'category', type: 'string'),
                        new OA\Property(property: 'amount', type: 'number'),
                        new OA\Property(property: 'expense_date', type: 'string', format: 'date'),
                        new OA\Property(property: 'description', type: 'string', nullable: true),
                        new OA\Property(property: 'receipt', type: 'string', format: 'binary', nullable: true),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Expense created successfully')
        ]
    )]
    public function store(ExpenseRequest $request)
    {
        return $this->executeAction(function () use ($request) {
            $expense = $this->expenseService->createExpense($request->validated());
            return new ExpenseResource($expense);
        }, 'Expense created successfully', 201);
    }

    #[OA\Get(
        path: '/business/expenses/{id}',
        summary: 'Get Expense',
        description: 'Get details of a specific expense.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(Expense $expense)
    {
        return $this->executeAction(function () use ($expense) {
            $expense->load('addedBy');
            return new ExpenseResource($expense);
        }, 'Expense retrieved successfully');
    }

    #[OA\Put(
        path: '/business/expenses/{id}',
        summary: 'Update Expense',
        description: 'Update an existing expense record.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['category', 'amount', 'expense_date'],
                    properties: [
                        new OA\Property(property: '_method', type: 'string', example: 'PUT', description: 'Required for multipart/form-data PUT requests'),
                        new OA\Property(property: 'category', type: 'string'),
                        new OA\Property(property: 'amount', type: 'number'),
                        new OA\Property(property: 'expense_date', type: 'string', format: 'date'),
                        new OA\Property(property: 'description', type: 'string', nullable: true),
                        new OA\Property(property: 'receipt', type: 'string', format: 'binary', nullable: true),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Expense updated successfully')
        ]
    )]
    public function update(ExpenseRequest $request, Expense $expense)
    {
        return $this->executeAction(function () use ($expense, $request) {
            $expense = $this->expenseService->updateExpense($expense, $request->validated());
            return new ExpenseResource($expense);
        }, 'Expense updated successfully', 200);
    }

    #[OA\Delete(
        path: '/business/expenses/{id}',
        summary: 'Delete Expense',
        description: 'Delete an existing expense record.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Expense deleted successfully')
        ]
    )]
    public function destroy(Expense $expense)
    {
        return $this->executeAction(function () use ($expense) {
            $this->expenseService->deleteExpense($expense);
            return null;
        }, 'Expense deleted successfully', 200);
    }

    #[OA\Get(
        path: '/business/expenses/analytics',
        summary: 'Get Expenses Analytics',
        description: 'Get analytical data for expenses including totals and category breakdowns.',
        tags: ['Business - Expenses'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function analytics(Request $request)
    {
        try {
            $dateFilter = $request->input('date_filter', 'monthly'); // daily, weekly, monthly, yearly
            $data = $this->expenseService->getAnalytics($dateFilter);
            return $this->success($data, 'Analytics retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
