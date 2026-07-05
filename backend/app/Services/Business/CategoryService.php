<?php

namespace App\Services\Business;

use App\Models\Category;

class CategoryService
{
    public function getCategories()
    {
        return Category::withCount('products')->latest()->get();
    }

    public function createCategory(array $data)
    {
        return Category::create($data);
    }

    public function updateCategory(Category $category, array $data)
    {
        $category->update($data);
        return $category;
    }

    public function deleteCategory(Category $category)
    {
        $category->delete();
    }
}
