<?php

namespace App\Services\Business;

use App\Models\Product;

class InventoryService
{
    public function getInventory($filters = [], $perPage = 10)
    {
        $query = Product::with(['category', 'brand'])->latest();
        
        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('brand', function ($q2) use ($filters) {
                    $q2->where('name', 'like', '%' . $filters['search'] . '%');
                })
                ->orWhere('model_name', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (isset($filters['low_stock_days']) && $filters['low_stock_days'] !== '') {
            $qty = (int) $filters['low_stock_days'];
            $query->where('quantity', '<=', $qty);
        }

        return $query->paginate($perPage);
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
