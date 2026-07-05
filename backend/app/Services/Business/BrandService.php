<?php

namespace App\Services\Business;

use App\Models\Brand;

class BrandService
{
    public function getBrands()
    {
        return Brand::latest()->get();
    }

    public function createBrand(array $data)
    {
        return Brand::create($data);
    }

    public function updateBrand(Brand $brand, array $data)
    {
        $brand->update($data);
        return $brand;
    }

    public function deleteBrand(Brand $brand)
    {
        // Add check if brand is used by products if needed, 
        // for now we cascade or set null based on migration (we used nullOnDelete)
        $brand->delete();
    }
}
