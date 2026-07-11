<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\Business\InventoryService;
use OpenApi\Attributes as OA;

class InventoryController extends BaseController
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    #[OA\Get(
        path: '/business/inventory',
        summary: 'List Inventory Products',
        description: 'Get a paginated list of all products for the active business.',
        tags: ['Business - Inventory'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index(Request $request)
    {
        try {
            $filters = $request->only(['search', 'category_id', 'brand_id', 'low_stock_days']);
            $perPage = $request->input('per_page', 10);
            $paginator = $this->inventoryService->getInventory($filters, $perPage);
            
            return $this->paginated($paginator, 'Inventory retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    #[OA\Post(
        path: '/business/inventory',
        summary: 'Create Product',
        description: 'Adds a new product to the inventory.',
        tags: ['Business - Inventory'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['category_id', 'brand', 'model_name', 'purchase_price', 'mrp', 'quantity'],
                properties: [
                    new OA\Property(property: 'category_id', type: 'integer'),
                    new OA\Property(property: 'brand', type: 'string'),
                    new OA\Property(property: 'model_name', type: 'string'),
                    new OA\Property(property: 'imei', type: 'string', nullable: true),
                    new OA\Property(property: 'serial_no', type: 'string', nullable: true),
                    new OA\Property(property: 'variant', type: 'string', nullable: true),
                    new OA\Property(property: 'purchase_price', type: 'number'),
                    new OA\Property(property: 'mrp', type: 'number'),
                    new OA\Property(property: 'quantity', type: 'integer'),
                    new OA\Property(property: 'supplier_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'status', type: 'string', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Product created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'model_name' => 'required|string|max:255',
            'imei' => 'nullable|string|max:255',
            'serial_no' => 'nullable|string|max:255',
            'variant' => 'nullable|string|max:255',
            'purchase_price' => 'required|numeric|min:0',
            'mrp' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'supplier_id' => 'nullable|integer',
            'status' => 'nullable|string|in:in_stock,sold,damaged'
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->inventoryService->createProduct($validated);
        }, 'Product created successfully');
    }

    #[OA\Get(
        path: '/business/inventory/{id}',
        summary: 'Get Product',
        description: 'Get details of a specific product.',
        tags: ['Business - Inventory'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(Product $inventory)
    {
        return $this->success($inventory->load('category'), 'Product retrieved successfully');
    }

    #[OA\Patch(
        path: '/business/inventory/{id}',
        summary: 'Update Product',
        description: 'Updates a specific product in the inventory.',
        tags: ['Business - Inventory'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'category_id', type: 'integer'),
                    new OA\Property(property: 'brand', type: 'string'),
                    new OA\Property(property: 'model_name', type: 'string'),
                    new OA\Property(property: 'imei', type: 'string', nullable: true),
                    new OA\Property(property: 'purchase_price', type: 'number'),
                    new OA\Property(property: 'mrp', type: 'number'),
                    new OA\Property(property: 'quantity', type: 'integer')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Product updated successfully')
        ]
    )]
    public function update(Request $request, Product $inventory)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'model_name' => 'sometimes|string|max:255',
            'imei' => 'nullable|string|max:255',
            'serial_no' => 'nullable|string|max:255',
            'variant' => 'nullable|string|max:255',
            'purchase_price' => 'sometimes|numeric|min:0',
            'mrp' => 'sometimes|numeric|min:0',
            'supplier_id' => 'nullable|integer',
            'status' => 'nullable|string|in:in_stock,sold,damaged'
        ]);

        return $this->executeAction(function () use ($inventory, $validated) {
            return $this->inventoryService->updateProduct($inventory, $validated);
        }, 'Product updated successfully');
    }

    #[OA\Delete(
        path: '/business/inventory/{id}',
        summary: 'Delete Product',
        description: 'Deletes a product from the inventory.',
        tags: ['Business - Inventory'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Product deleted successfully')
        ]
    )]
    public function destroy(Product $inventory)
    {
        return $this->executeAction(function () use ($inventory) {
            $this->inventoryService->deleteProduct($inventory);
            return null;
        }, 'Product deleted successfully');
    }

    #[OA\Post(
        path: '/business/inventory/direct-inward',
        summary: 'Direct Add Stock',
        description: 'Directly add stock to an existing product without a supplier bill.',
        tags: ['Business - Inventory'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['product_id', 'quantity'],
                properties: [
                    new OA\Property(property: 'product_id', type: 'integer'),
                    new OA\Property(property: 'quantity', type: 'integer'),
                    new OA\Property(property: 'purchase_price', type: 'number', nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Stock added successfully')
        ]
    )]
    public function directInward(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'nullable|numeric|min:0',
            'mrp' => 'nullable|numeric|min:0',
            'batch_number' => 'nullable|string|max:255',
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->inventoryService->directInward($validated);
        }, 'Stock added successfully');
    }
}
