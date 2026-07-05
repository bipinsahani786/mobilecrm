<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Services\Business\CategoryService;
use OpenApi\Attributes as OA;

class CategoryController extends BaseController
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    #[OA\Get(
        path: '/business/categories',
        summary: 'List Categories',
        description: 'Get a list of all product categories for the active business.',
        tags: ['Business - Categories'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index()
    {
        return $this->executeAction(function () {
            return $this->categoryService->getCategories();
        }, 'Categories retrieved successfully');
    }

    #[OA\Post(
        path: '/business/categories',
        summary: 'Create Category',
        description: 'Creates a new product category.',
        tags: ['Business - Categories'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Category created successfully')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->categoryService->createCategory($validated);
        }, 'Category created successfully');
    }

    #[OA\Get(
        path: '/business/categories/{id}',
        summary: 'Get Category',
        description: 'Get details of a specific category.',
        tags: ['Business - Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(Category $category)
    {
        return $this->success($category, 'Category retrieved successfully');
    }

    #[OA\Patch(
        path: '/business/categories/{id}',
        summary: 'Update Category',
        description: 'Updates a specific product category.',
        tags: ['Business - Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Category updated successfully')
        ]
    )]
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return $this->executeAction(function () use ($category, $validated) {
            return $this->categoryService->updateCategory($category, $validated);
        }, 'Category updated successfully');
    }

    #[OA\Delete(
        path: '/business/categories/{id}',
        summary: 'Delete Category',
        description: 'Deletes a product category.',
        tags: ['Business - Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Category deleted successfully')
        ]
    )]
    public function destroy(Category $category)
    {
        return $this->executeAction(function () use ($category) {
            $this->categoryService->deleteCategory($category);
            return null;
        }, 'Category deleted successfully');
    }
}
