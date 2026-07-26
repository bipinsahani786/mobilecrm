<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Services\Business\StaffService;
use Illuminate\Http\Request;

class StaffController extends BaseController
{
    public function __construct(private StaffService $staffService)
    {
    }

    public function index()
    {
        try {
            $staff = $this->staffService->getStaff();
            return $this->success($staff, 'Staff retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:staff,manager',
            'salary_type' => 'nullable|string|in:monthly,daily',
            'monthly_salary' => 'nullable|numeric|min:0',
            'daily_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'join_date' => 'nullable|date',
            'salary_components' => 'nullable|array',
        ]);

        // Check if phone or email already exists as staff in this business
        $businessId = app('current_business_id');
        $existingByPhone = \App\Models\User::where('phone', $request->phone)
            ->whereHas('businesses', fn($q) => $q->where('business_id', $businessId))
            ->first();

        if ($existingByPhone) {
            return $this->error("Phone number '{$request->phone}' is already registered as staff in this business ({$existingByPhone->name}).", 422);
        }

        if ($request->email) {
            $existingByEmail = \App\Models\User::where('email', $request->email)
                ->whereHas('businesses', fn($q) => $q->where('business_id', $businessId))
                ->first();

            if ($existingByEmail) {
                return $this->error("Email '{$request->email}' is already registered as staff in this business ({$existingByEmail->name}).", 422);
            }
        }

        try {
            $staff = $this->staffService->addStaff($request->all());
            return $this->success($staff, 'Staff added successfully', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function show(int $id)
    {
        try {
            $data = $this->staffService->getStaffDetail($id);
            return $this->success($data, 'Staff detail retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 404);
        }
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'role' => 'nullable|string|in:staff,manager',
            'salary_type' => 'nullable|string|in:monthly,daily',
            'monthly_salary' => 'nullable|numeric|min:0',
            'daily_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'join_date' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive',
            'salary_components' => 'nullable|array',
        ]);

        try {
            $this->staffService->updateStaff($id, $request->all());
            return $this->success(null, 'Staff updated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->staffService->deactivateStaff($id);
            return $this->success(null, 'Staff deactivated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function salesReport(Request $request, int $id)
    {
        try {
            $sales = $this->staffService->getStaffSalesReport($id, $request->input('per_page', 15));
            return $this->success($sales, 'Sales report retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function getPermissions(int $id)
    {
        try {
            $permissions = $this->staffService->getStaffPermissions($id);
            return $this->success($permissions, 'Permissions retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function updatePermissions(Request $request, int $id)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string'
        ]);

        try {
            $this->staffService->updateStaffPermissions($id, $request->input('permissions', []));
            return $this->success(null, 'Permissions updated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function earnings($id)
    {
        try {
            $user = \App\Models\User::findOrFail($id);
            $businessId = app('current_business_id');
            $month = \Carbon\Carbon::now()->format('Y-m');

            // Get staff salary type from pivot
            $staffData = \Illuminate\Support\Facades\DB::table('business_user')
                ->where('business_id', $businessId)
                ->where('user_id', $user->id)
                ->first();

            $salaryType = $staffData->salary_type ?? 'monthly';

            $payrollService = app(\App\Services\Business\PayrollService::class);
            $draftPayroll = $payrollService->generateForEmployee($user->id, $month);

            $today = \Carbon\Carbon::today();

            $todayAttendance = \App\Models\Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            $todayCommission = \App\Models\SaleCommission::where('user_id', $user->id)
                ->whereDate('created_at', $today)
                ->sum('commission_amount');

            $todayEarnings = 0;
            if ($todayAttendance && in_array($todayAttendance->status, ['present', 'half_day'])) {
                $multiplier = ($todayAttendance->status === 'half_day') ? 0.5 : 1;
                $todayEarnings = ($draftPayroll->per_day_salary * $multiplier);
            }
            $todayEarnings += $todayCommission;

            $advanceTaken = $draftPayroll->advance_deduction;

            if ($salaryType === 'daily') {
                // Daily staff: base_salary IS exactly the earned amount
                $monthlyEarnings = $draftPayroll->base_salary + $draftPayroll->total_commission;
                $draftDues = $monthlyEarnings - $advanceTaken;
            } else {
                // Monthly staff: calculate EXACT earned amount till date (excluding future days)
                $effectivePresent = $draftPayroll->present_days + ($draftPayroll->half_days * 0.5) + $draftPayroll->paid_leaves;
                $earnedBaseTillDate = $effectivePresent * $draftPayroll->per_day_salary;
                $monthlyEarnings = $earnedBaseTillDate + $draftPayroll->total_commission;
                $draftDues = $monthlyEarnings - $advanceTaken;
            }

            $unpaidPayrolls = \App\Models\Payroll::where('user_id', $user->id)
                ->where('status', 'confirmed')
                ->sum('final_salary');

            $totalDues = $unpaidPayrolls + $draftDues;

            return response()->json([
                'success' => true,
                'data' => [
                    'today_earnings' => round($todayEarnings, 2),
                    'monthly_earnings' => round($monthlyEarnings, 2),
                    'advance_taken' => round($advanceTaken, 2),
                    'total_dues' => round($totalDues, 2),
                ]
            ]);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function impersonate($id)
    {
        try {
            $staffUser = \App\Models\User::findOrFail($id);
            $currentUser = request()->user();

            if ($currentUser->hasRole(['staff', 'manager'])) {
                return $this->error('You do not have permission to impersonate.', 403);
            }

            $businessId = app('current_business_id');
            $exists = $staffUser->businesses()->where('business_id', $businessId)->exists();

            if (!$exists) {
                return $this->error('Staff does not belong to this business.', 403);
            }

            $token = $staffUser->createToken('impersonation-token')->plainTextToken;

            $staffUser->load('roles', 'businesses');

            $userData = $staffUser->toArray();
            $userData['permissions'] = $staffUser->getAllPermissions()->pluck('name');

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $userData,
                'message' => 'Successfully impersonated staff.'
            ]);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
