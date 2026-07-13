<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\Customer;
use App\Services\Business\CustomerService;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Business - Customers', description: 'API Endpoints for Managing Customers')]
class CustomerController extends BaseController
{
    public function __construct(private CustomerService $customerService)
    {
    }

    #[OA\Get(
        path: '/business/customers',
        summary: 'List Customers',
        description: 'Get a paginated list of customers.',
        tags: ['Business - Customers'],
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
            $hasUdhar = $request->input('has_udhar');

            $paginator = $this->customerService->getCustomers($perPage, $search, $hasUdhar);
            return $this->paginated($paginator, 'Customers retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Get(
        path: '/business/customers/{id}',
        summary: 'Get Customer',
        description: 'Get details of a specific customer.',
        tags: ['Business - Customers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(Customer $customer)
    {
        return $this->executeAction(function () use ($customer) {
            $customer->load(['sales.items.product', 'sales.payments', 'sales.emiDetail']);
            return $customer;
        }, 'Customer retrieved successfully');
    }

    #[OA\Post(
        path: '/business/customers',
        summary: 'Create Customer',
        description: 'Creates a new customer.',
        tags: ['Business - Customers'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'address', type: 'string', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Customer created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->customerService->createCustomer($validated);
        }, 'Customer created successfully', 201);
    }

    #[OA\Put(
        path: '/business/customers/{id}',
        summary: 'Update Customer',
        description: 'Updates a specific customer.',
        tags: ['Business - Customers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'address', type: 'string', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Customer updated successfully')
        ]
    )]
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        return $this->executeAction(function () use ($customer, $validated) {
            return $this->customerService->updateCustomer($customer, $validated);
        }, 'Customer updated successfully');
    }

    #[OA\Delete(
        path: '/business/customers/{id}',
        summary: 'Delete Customer',
        description: 'Deletes a customer.',
        tags: ['Business - Customers'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Customer deleted successfully')
        ]
    )]
    public function destroy(Customer $customer)
    {
        return $this->executeAction(function () use ($customer) {
            $this->customerService->deleteCustomer($customer);
            return null;
        }, 'Customer deleted successfully');
    }
}
