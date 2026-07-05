<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Models\Brand;
use App\Services\Business\BrandService;
use Illuminate\Http\Request;

class BrandController extends BaseController
{
    public function __construct(private BrandService $brandService)
    {
    }

    public function index()
    {
        return $this->executeAction(function () {
            return $this->brandService->getBrands();
        }, 'Brands retrieved successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        return $this->executeAction(function () use ($validated) {
            return $this->brandService->createBrand($validated);
        }, 'Brand created successfully', 201);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        return $this->executeAction(function () use ($brand, $validated) {
            return $this->brandService->updateBrand($brand, $validated);
        }, 'Brand updated successfully');
    }

    public function destroy(Brand $brand)
    {
        return $this->executeAction(function () use ($brand) {
            $this->brandService->deleteBrand($brand);
            return null;
        }, 'Brand deleted successfully');
    }
}
