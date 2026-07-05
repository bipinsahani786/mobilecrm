<?php

namespace App\Services\Business;

use App\Models\Product;

class InventoryService
{
    public function getInventory($filters = [], $perPage = 10)
    {
        $query = Product::with('category')->latest();
        
        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('brand', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('model_name', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->paginate($perPage);
    }

    public function getBrands()
    {
        // Pluck distinct non-null brands for the active tenant
        return Product::whereNotNull('brand')
            ->where('brand', '!=', '')
            ->distinct()
            ->pluck('brand')
            ->values();
    }

    public function createProduct(array $data)
    {
        return Product::create($data);
    }

    public function updateProduct(Product $product, array $data)
    {
        $product->update($data);
        return $product;
    }

    public function deleteProduct(Product $product)
    {
        $product->delete();
    }
}
