<?php

namespace App\Services\Business;

use App\Models\Expense;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseService
{
    /**
     * Get paginated expenses for the current business.
     */
    public function getExpenses(int $perPage = 15): LengthAwarePaginator
    {
        return Expense::with('addedBy')
            ->latest('expense_date')
            ->latest('id')
            ->paginate($perPage);
    }

    /**
     * Create a new expense.
     */
    public function createExpense(array $data): Expense
    {
        if (isset($data['receipt']) && $data['receipt'] instanceof \Illuminate\Http\UploadedFile) {
            $data['receipt_path'] = $data['receipt']->store('receipts', 'public');
        }

        $data['added_by'] = auth()->id();
        
        return Expense::create($data);
    }

    /**
     * Update an existing expense.
     */
    public function updateExpense(Expense $expense, array $data): Expense
    {
        if (isset($data['receipt']) && $data['receipt'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old receipt if exists
            if ($expense->receipt_path) {
                Storage::disk('public')->delete($expense->receipt_path);
            }
            $data['receipt_path'] = $data['receipt']->store('receipts', 'public');
        }

        $expense->update($data);

        return $expense;
    }

    /**
     * Delete an expense.
     */
    public function deleteExpense(Expense $expense): bool
    {
        if ($expense->receipt_path) {
            Storage::disk('public')->delete($expense->receipt_path);
        }
        
        return $expense->delete();
    }
}
