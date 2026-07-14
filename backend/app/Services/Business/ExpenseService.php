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
    public function getExpenses(int $perPage = 15, $search = null, $category = null, $startDate = null, $endDate = null): LengthAwarePaginator
    {
        $query = Expense::with('addedBy')
            ->latest('expense_date')
            ->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($startDate) {
            $query->whereDate('expense_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('expense_date', '<=', $endDate);
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new expense.
     */
    public function createExpense(array $data): Expense
    {
        if (isset($data['category'])) {
            $this->ensureCategoryExists($data['category']);
        }

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
        if (isset($data['category'])) {
            $this->ensureCategoryExists($data['category']);
        }

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

    /**
     * Ensure the category exists in the business's expense categories.
     */
    private function ensureCategoryExists(string $categoryName): void
    {
        // Trim category just in case
        $categoryName = trim($categoryName);
        if (empty($categoryName)) {
            return;
        }

        // We use firstOrCreate which will respect the TenantScope for business_id
        // since TenantScope automatically applies business_id to the query.
        // Wait, TenantScope applies to select. For firstOrCreate we need business_id.
        $businessId = app('current_business_id') ?? (auth()->check() ? auth()->user()->business_id : null);
        
        if ($businessId) {
            \App\Models\ExpenseCategory::firstOrCreate([
                'business_id' => $businessId,
                'name' => $categoryName
            ]);
        }
    }

    /**
     * Get expense analytics
     */
    public function getAnalytics(string $dateFilter = 'monthly'): array
    {
        $now = now();
        $startOfThisMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();
        
        $todayStr = $now->format('Y-m-d');

        // Since TenantScope automatically applies business_id, we just query Expense directly
        $totalAllTime = Expense::sum('amount') ?? 0;
        
        $totalToday = Expense::whereDate('expense_date', $todayStr)->sum('amount') ?? 0;
        
        $totalThisMonth = Expense::where('expense_date', '>=', $startOfThisMonth)->sum('amount') ?? 0;
        
        $totalLastMonth = Expense::whereBetween('expense_date', [$startOfLastMonth, $endOfLastMonth])->sum('amount') ?? 0;

        $percentChange = 0;
        if ($totalLastMonth > 0) {
            $percentChange = (($totalThisMonth - $totalLastMonth) / $totalLastMonth) * 100;
        } else if ($totalThisMonth > 0) {
            $percentChange = 100;
        }

        // Breakdown based on filter
        $query = Expense::query();
        switch ($dateFilter) {
            case 'daily':
                $query->whereDate('expense_date', $todayStr);
                break;
            case 'weekly':
                $query->whereBetween('expense_date', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]);
                break;
            case 'yearly':
                $query->whereYear('expense_date', $now->year);
                break;
            case 'monthly':
            default:
                $query->whereBetween('expense_date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()]);
                break;
        }

        $categoryBreakdown = $query->selectRaw('category as name, SUM(amount) as value')
            ->groupBy('category')
            ->orderByDesc('value')
            ->get();

        return [
            'total_all_time' => (float) $totalAllTime,
            'total_today' => (float) $totalToday,
            'total_this_month' => (float) $totalThisMonth,
            'total_last_month' => (float) $totalLastMonth,
            'percent_change' => round((float) $percentChange, 1),
            'category_breakdown' => $categoryBreakdown
        ];
    }
}
