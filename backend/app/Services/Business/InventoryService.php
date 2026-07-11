<?php

namespace App\Services\Business;

use App\Models\Product;

class InventoryService
{
    public function getInventory($filters = [], $perPage = 10)
    {
        $query = Product::with(['category', 'brand', 'batches'])->latest();
        
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
        $product = Product::create($data);

        if ($product->quantity > 0) {
            // Create initial inventory movement
            $product->movements()->create([
                'business_id' => $product->business_id,
                'type' => 'in',
                'quantity' => $product->quantity,
                'reference_type' => 'initial_stock',
                'notes' => 'Initial stock on creation',
            ]);

            // Create initial product batch
            $product->batches()->create([
                'batch_number' => $data['batch_number'] ?? null,
                'original_quantity' => $product->quantity,
                'remaining_quantity' => $product->quantity,
                'purchase_price' => $product->purchase_price ?? 0,
                'mrp' => $product->mrp ?? 0,
                'reference_type' => 'initial_stock',
            ]);
            
            // Log activity
            $product->logActivity('stock_added', "Initial stock of {$product->quantity} units added");
        }

        return $product;
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

    public function directInward(array $data)
    {
        $product = Product::findOrFail($data['product_id']);

        // Create inventory movement
        $movement = $product->movements()->create([
            'business_id' => $product->business_id,
            'type' => 'in',
            'quantity' => $data['quantity'],
            'reference_type' => 'direct_add',
            'notes' => 'Direct inventory addition',
        ]);

        // Create product batch
        $product->batches()->create([
            'batch_number' => $data['batch_number'] ?? null,
            'original_quantity' => $data['quantity'],
            'remaining_quantity' => $data['quantity'],
            'purchase_price' => $data['purchase_price'] ?? $product->purchase_price ?? 0,
            'mrp' => $data['mrp'] ?? $product->mrp ?? 0,
            'reference_type' => 'direct_add',
        ]);

        // Update product quantity and purchase price
        $product->quantity += $data['quantity'];
        if (isset($data['purchase_price'])) {
            $product->purchase_price = $data['purchase_price'];
        }
        if (isset($data['mrp'])) {
            $product->mrp = $data['mrp'];
        }
        $product->save();

        // Log activity using the trait
        $product->logActivity('stock_adjusted', "Directly added {$data['quantity']} units of {$product->model_name}");

        return $product;
    }
}
