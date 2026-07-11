<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\Brand;
use App\Services\Business\BrandService;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Brands",
 *     description="API Endpoints for Managing Brands"
 * )
 */
class BrandController extends BaseController
{
    public function __construct(private BrandService $brandService)
    {
    }

    /**
     * @OA\Get(
     *     path="/api/v1/business/brands",
     *     summary="Get all brands",
     *     tags={"Brands"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Brands retrieved successfully"
     *     )
     * )
     */
    public function index()
    {
        return $this->executeAction(function () {
            return $this->brandService->getBrands();
        }, 'Brands retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/business/brands",
     *     summary="Create a new brand",
     *     tags={"Brands"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Brand created successfully"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->brandService->createBrand($validated);
        }, 'Brand created successfully', 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/business/brands/{id}",
     *     summary="Update a brand",
     *     tags={"Brands"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Brand updated successfully"
     *     )
     * )
     */
    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        return $this->executeAction(function () use ($brand, $validated) {
            return $this->brandService->updateBrand($brand, $validated);
        }, 'Brand updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/business/brands/{id}",
     *     summary="Delete a brand",
     *     tags={"Brands"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Brand deleted successfully"
     *     )
     * )
     */
    public function destroy(Brand $brand)
    {
        return $this->executeAction(function () use ($brand) {
            $this->brandService->deleteBrand($brand);
            return null;
        }, 'Brand deleted successfully');
    }
}
