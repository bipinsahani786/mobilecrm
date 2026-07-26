<?php

namespace App\Services\Business;

use App\Models\User;
use App\Models\SaleCommission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffService
{
    /**
     * Get all staff members for the current business.
     */
    public function getStaff()
    {
        $businessId = app('current_business_id');
        $business = \App\Models\Business::find($businessId);
        $ownerId = $business ? $business->owner_id : null;

        $staff = DB::table('business_user')
            ->join('users', 'business_user.user_id', '=', 'users.id')
            ->where('business_user.business_id', $businessId)
            ->whereNull('users.deleted_at')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.avatar',
                'business_user.role',
                'business_user.salary_type',
                'business_user.monthly_salary',
                'business_user.daily_salary',
                'business_user.salary_components',
                'business_user.commission_rate',
                'business_user.join_date',
                'business_user.status'
            )
            ->orderBy('users.name')
            ->get();

        return $staff->map(function ($member) use ($ownerId) {
            $member->is_owner = $member->id === $ownerId;
            return $member;
        });
    }

    /**
     * Add a new staff member to the business.
     */
    public function addStaff(array $data): array
    {
        $businessId = app('current_business_id');

        return DB::transaction(function () use ($data, $businessId) {
            // Find existing user by phone or email, or create new
            $user = User::where('phone', $data['phone'])->first();

            if (!$user && !empty($data['email'])) {
                $user = User::where('email', $data['email'])->first();
            }

            if (!$user) {
                $user = User::create([
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'email' => $data['email'] ?? null,
                    'password' => Hash::make($data['password'] ?? $data['phone']), // Default password = phone
                    'status' => 'active',
                ]);
            }

            // Check if already attached
            $exists = DB::table('business_user')
                ->where('business_id', $businessId)
                ->where('user_id', $user->id)
                ->exists();

            if ($exists) {
                throw new \Exception('This user is already a staff member of this business.');
            }

            // Attach to business with pivot data
            DB::table('business_user')->insert([
                'business_id' => $businessId,
                'user_id' => $user->id,
                'role' => $data['role'] ?? 'staff',
                'salary_type' => $data['salary_type'] ?? 'monthly',
                'monthly_salary' => $data['monthly_salary'] ?? 0,
                'daily_salary' => $data['daily_salary'] ?? null,
                'salary_components' => isset($data['salary_components']) ? json_encode($data['salary_components']) : null,
                'commission_rate' => $data['commission_rate'] ?? 0,
                'join_date' => $data['join_date'] ?? now()->toDateString(),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign Staff role (Spatie)
            if (!$user->hasRole('Staff')) {
                // Create role if it doesn't exist
                $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
                $user->assignRole($role);
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'salary_type' => $data['salary_type'] ?? 'monthly',
                'monthly_salary' => $data['monthly_salary'] ?? 0,
                'daily_salary' => $data['daily_salary'] ?? null,
                'salary_components' => $data['salary_components'] ?? null,
                'commission_rate' => $data['commission_rate'] ?? 0,
                'join_date' => $data['join_date'] ?? now()->toDateString(),
                'status' => 'active',
            ];
        });
    }

    /**
     * Update staff pivot data.
     */
    public function updateStaff(int $userId, array $data): void
    {
        $businessId = app('current_business_id');

        // Update user basic info
        $user = User::findOrFail($userId);
        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['phone'])) $user->phone = $data['phone'];
        $user->save();

        // Update pivot data
        $pivotData = [];
        if (isset($data['salary_type'])) $pivotData['salary_type'] = $data['salary_type'];
        if (isset($data['monthly_salary'])) $pivotData['monthly_salary'] = $data['monthly_salary'];
        if (array_key_exists('daily_salary', $data)) $pivotData['daily_salary'] = $data['daily_salary'];
        if (array_key_exists('salary_components', $data)) {
            $pivotData['salary_components'] = is_array($data['salary_components']) ? json_encode($data['salary_components']) : $data['salary_components'];
        }
        if (isset($data['commission_rate'])) $pivotData['commission_rate'] = $data['commission_rate'];
        if (isset($data['join_date'])) $pivotData['join_date'] = $data['join_date'];
        if (isset($data['status'])) {
            if ($data['status'] === 'inactive') {
                if ($userId === auth()->id()) {
                    throw new \Exception('You cannot deactivate your own account.');
                }
                $existingRole = DB::table('business_user')->where('business_id', $businessId)->where('user_id', $userId)->value('role');
                if ($existingRole === 'admin') {
                    throw new \Exception('A business admin cannot be deactivated.');
                }
            }
            $pivotData['status'] = $data['status'];
        }
        if (isset($data['role'])) $pivotData['role'] = $data['role'];

        if (!empty($pivotData)) {
            $pivotData['updated_at'] = now();
            DB::table('business_user')
                ->where('business_id', $businessId)
                ->where('user_id', $userId)
                ->update($pivotData);
        }
    }

    /**
     * Deactivate a staff member.
     */
    public function deactivateStaff(int $userId): void
    {
        $businessId = app('current_business_id');

        if ($userId === auth()->id()) {
            throw new \Exception('You cannot deactivate your own account.');
        }

        $existingRole = DB::table('business_user')->where('business_id', $businessId)->where('user_id', $userId)->value('role');
        if ($existingRole === 'admin') {
            throw new \Exception('A business admin cannot be deactivated.');
        }

        DB::table('business_user')
            ->where('business_id', $businessId)
            ->where('user_id', $userId)
            ->update(['status' => 'inactive', 'updated_at' => now()]);
    }

    /**
     * Get staff detail with sales stats.
     */
    public function getStaffDetail(int $userId): array
    {
        $businessId = app('current_business_id');

        $staff = DB::table('business_user')
            ->join('users', 'business_user.user_id', '=', 'users.id')
            ->where('business_user.business_id', $businessId)
            ->where('business_user.user_id', $userId)
            ->select(
                'users.id', 'users.name', 'users.email', 'users.phone', 'users.avatar',
                'business_user.role', 'business_user.salary_type', 'business_user.monthly_salary',
                'business_user.daily_salary', 'business_user.salary_components',
                'business_user.commission_rate', 'business_user.join_date', 'business_user.status'
            )
            ->first();

        if (!$staff) {
            throw new \Exception('Staff member not found.');
        }

        // Sales stats
        $totalSales = \App\Models\Sale::where('user_id', $userId)->count();
        $totalSalesAmount = \App\Models\Sale::where('user_id', $userId)->sum('final_amount');
        $totalCommission = SaleCommission::where('user_id', $userId)->sum('commission_amount');

        // This month stats
        $thisMonth = now()->startOfMonth();
        $thisMonthSales = \App\Models\Sale::where('user_id', $userId)
            ->where('date', '>=', $thisMonth)->count();
        $thisMonthSalesAmount = \App\Models\Sale::where('user_id', $userId)
            ->where('date', '>=', $thisMonth)->sum('final_amount');
        $thisMonthCommission = SaleCommission::where('user_id', $userId)
            ->where('created_at', '>=', $thisMonth)->sum('commission_amount');

        return [
            'staff' => $staff,
            'stats' => [
                'total_sales' => $totalSales,
                'total_sales_amount' => (float) $totalSalesAmount,
                'total_commission' => (float) $totalCommission,
                'this_month_sales' => $thisMonthSales,
                'this_month_sales_amount' => (float) $thisMonthSalesAmount,
                'this_month_commission' => (float) $thisMonthCommission,
            ],
        ];
    }

    /**
     * Get sales report for a staff member.
     */
    public function getStaffSalesReport(int $userId, int $perPage = 15)
    {
        return \App\Models\Sale::where('user_id', $userId)
            ->with(['customer', 'items.product'])
            ->latest('date')
            ->paginate($perPage);
    }

    /**
     * Get staff permissions for the current business.
     */
    public function getStaffPermissions(int $userId): array
    {
        $businessId = app('current_business_id');
        $user = User::findOrFail($userId);

        // Temporarily set the Spatie team id to fetch scoped permissions
        setPermissionsTeamId($businessId);
        
        return $user->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Update staff permissions for the current business.
     */
    public function updateStaffPermissions(int $userId, array $permissions): void
    {
        $businessId = app('current_business_id');
        $user = User::findOrFail($userId);

        // Ensure we only grant permissions that exist
        foreach ($permissions as $perm) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        setPermissionsTeamId($businessId);
        $user->syncPermissions($permissions);
    }

    /**
     * Get staff performance report (sales, profit, commission)
     */
    public function getPerformanceReport(string $fromDate, string $toDate): array
    {
        $businessId = app('current_business_id');
        $business = \App\Models\Business::find($businessId);
        $commissionBase = $business->settings['commission_calculation_base'] ?? 'sales';

        $staff = DB::table('business_user')
            ->join('users', 'business_user.user_id', '=', 'users.id')
            ->where('business_user.business_id', $businessId)
            ->where('business_user.status', 'active')
            ->whereNull('users.deleted_at')
            ->select(
                'users.id',
                'users.name',
                'business_user.commission_rate'
            )
            ->get();

        $report = [];

        foreach ($staff as $member) {
            // Get all sales for this staff member in the date range
            $sales = \App\Models\Sale::where('user_id', $member->id)
                ->where('business_id', $businessId)
                ->whereBetween('date', [$fromDate, $toDate])
                ->where('status', 'completed')
                ->with('items.batch')
                ->get();

            $totalSalesAmount = 0;
            $totalProfit = 0;
            $productsSold = [];

            foreach ($sales as $sale) {
                $totalSalesAmount += $sale->final_amount;

                foreach ($sale->items as $item) {
                    $purchasePrice = $item->batch ? $item->batch->purchase_price : 0;
                    $itemProfit = ($item->unit_price - $purchasePrice) * $item->quantity;
                    $totalProfit += $itemProfit;

                    // Collect products sold info
                    $productId = $item->product_id;
                    if (!isset($productsSold[$productId])) {
                        $productsSold[$productId] = [
                            'name' => $item->product->model_name ?? 'Unknown Product',
                            'quantity' => 0,
                            'total_sale' => 0,
                            'total_profit' => 0,
                        ];
                    }
                    $productsSold[$productId]['quantity'] += $item->quantity;
                    $productsSold[$productId]['total_sale'] += ($item->unit_price * $item->quantity);
                    $productsSold[$productId]['total_profit'] += $itemProfit;
                }
            }

            $commissionRate = (float) $member->commission_rate;
            $commissionAmount = 0;

            if ($commissionBase === 'profit') {
                $commissionAmount = $totalProfit * ($commissionRate / 100);
            } else {
                $commissionAmount = $totalSalesAmount * ($commissionRate / 100);
            }

            $report[] = [
                'user_id' => $member->id,
                'name' => $member->name,
                'total_sales' => $sales->count(),
                'total_sales_amount' => $totalSalesAmount,
                'total_profit' => $totalProfit,
                'commission_rate' => $commissionRate,
                'commission_base' => $commissionBase,
                'calculated_commission' => $commissionAmount,
                'products_sold' => array_values($productsSold)
            ];
        }

        return $report;
    }
}
