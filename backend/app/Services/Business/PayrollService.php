<?php

namespace App\Services\Business;

use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\SaleCommission;
use App\Models\SalaryAdvance;
use App\Models\LeavePolicy;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayrollService
{
    /**
     * Generate payroll for a specific employee and month.
     */
    public function generateForEmployee(int $userId, string $month): Payroll
    {
        $businessId = app('current_business_id');

        // Check if payroll already exists
        $existing = Payroll::where('user_id', $userId)
            ->where('month', $month)
            ->first();

        if ($existing && $existing->status !== 'draft') {
            throw new \Exception('Payroll for this month is already confirmed/paid.');
        }

        // Get staff details from pivot
        $staffData = DB::table('business_user')
            ->where('business_id', $businessId)
            ->where('user_id', $userId)
            ->first();

        if (!$staffData) {
            throw new \Exception('Staff member not found.');
        }

        $components = $staffData->salary_components 
            ? json_decode($staffData->salary_components, true) 
            : [];

        $totalEarnings = 0;
        $totalDeductions = 0;

        if (is_array($components)) {
            // For backward compatibility: if old format, handle differently or treat as zero (or write logic)
            // But new format: array of objects [{id, name, type, amount}]
            foreach ($components as $comp) {
                if (is_array($comp) && isset($comp['type']) && isset($comp['amount'])) {
                    if ($comp['type'] === 'earning') {
                        $totalEarnings += (float) $comp['amount'];
                    } else if ($comp['type'] === 'deduction') {
                        $totalDeductions += (float) $comp['amount'];
                    }
                }
            }
        }

        // If no components array format found, fallback to monthly_salary
        if ($totalEarnings === 0 && $staffData->monthly_salary > 0) {
            $totalEarnings = (float) $staffData->monthly_salary;
        }

        $baseSalary = $totalEarnings - $totalDeductions;

        // Parse month to get date range
        $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();
        
        // Mid-month joining logic
        $user = \App\Models\User::find($userId);
        
        $joiningDateStr = $staffData->join_date ?? $staffData->created_at ?? $user?->created_at;
        $joiningDate = $joiningDateStr ? Carbon::parse($joiningDateStr)->startOfDay() : clone $startOfMonth;
        
        if ($joiningDate->format('Y-m') === $month && $joiningDate->greaterThan($startOfMonth)) {
            $totalDaysInMonth = (int) (abs($joiningDate->diffInDays($endOfMonth)) + 1);
        } else {
            $totalDaysInMonth = $endOfMonth->day;
        }

        // Get attendance records for the month
        $attendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        $presentDays = $attendances->where('status', 'present')->count();
        $absentDays = $attendances->where('status', 'absent')->count();
        $halfDays = $attendances->where('status', 'half_day')->count();
        $leaveDays = $attendances->where('status', 'leave')->count();
        $weekOffs = $attendances->where('status', 'week_off')->count();
        $holidays = $attendances->where('status', 'holiday')->count();

        // Calculate paid leaves quota
        $paidLeaveQuota = LeavePolicy::where('is_paid', true)
            ->sum('monthly_quota');
        $paidLeaves = min($leaveDays, (int) $paidLeaveQuota);
        $unpaidLeaves = max(0, $leaveDays - $paidLeaves);

        // Working days = total days - week_offs - holidays
        $workingDays = $totalDaysInMonth - $weekOffs - $holidays;
        if ($workingDays <= 0) $workingDays = $totalDaysInMonth; // fallback

        $perDaySalary = $baseSalary / $workingDays;

        // Effective attendance = present + (half_days × 0.5) + paid_leaves
        $effectivePresent = $presentDays + ($halfDays * 0.5) + $paidLeaves;

        // Deduction = (working_days - effective_present - week_offs - holidays) * per_day
        $unpaidAbsences = max(0, $workingDays - $effectivePresent);
        $deduction = $unpaidAbsences * $perDaySalary;

        // Commission for this month
        $totalCommission = SaleCommission::where('user_id', $userId)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth->endOfDay()])
            ->sum('commission_amount');

        // Advance deductions
        $advanceDeduction = SalaryAdvance::where('user_id', $userId)
            ->where('deduct_in_month', $month)
            ->where('is_deducted', false)
            ->sum('amount');

        // Final salary
        $finalSalary = $baseSalary - $deduction + $totalCommission - $advanceDeduction;

        $payrollData = [
            'business_id' => $businessId,
            'user_id' => $userId,
            'month' => $month,
            'total_days' => $totalDaysInMonth,
            'present_days' => $presentDays,
            'absent_days' => $absentDays,
            'half_days' => $halfDays,
            'paid_leaves' => $paidLeaves,
            'unpaid_leaves' => $unpaidLeaves,
            'week_offs' => $weekOffs,
            'holidays' => $holidays,
            'base_salary' => $baseSalary,
            'per_day_salary' => round($perDaySalary, 2),
            'deduction' => round($deduction, 2),
            'total_commission' => (float) $totalCommission,
            'bonus' => $existing ? $existing->bonus : 0,
            'advance_deduction' => (float) $advanceDeduction,
            'salary_components' => json_encode($components),
            'final_salary' => round($finalSalary, 2),
            'status' => 'draft',
        ];

        if ($existing) {
            // Preserve manual bonus
            $payrollData['bonus'] = $existing->bonus;
            $payrollData['final_salary'] = round($finalSalary + $existing->bonus, 2);
            $existing->update($payrollData);
            return $existing->fresh();
        }

        return Payroll::create($payrollData);
    }

    /**
     * Generate payroll for all active staff for a month.
     */
    public function generateForAllStaff(string $month): array
    {
        $businessId = app('current_business_id');

        $staff = DB::table('business_user')
            ->where('business_id', $businessId)
            ->where('status', 'active')
            ->pluck('user_id');

        $results = [];
        foreach ($staff as $userId) {
            try {
                $results[] = $this->generateForEmployee($userId, $month);
            } catch (\Exception $e) {
                $results[] = ['user_id' => $userId, 'error' => $e->getMessage()];
            }
        }

        return $results;
    }

    /**
     * Confirm a payroll record.
     */
    public function confirmPayroll(Payroll $payroll): Payroll
    {
        if ($payroll->status !== 'draft') {
            throw new \Exception('Only draft payrolls can be confirmed.');
        }

        $payroll->update(['status' => 'confirmed']);

        // Mark salary advances as deducted
        SalaryAdvance::where('user_id', $payroll->user_id)
            ->where('deduct_in_month', $payroll->month)
            ->where('is_deducted', false)
            ->update(['is_deducted' => true]);

        return $payroll->fresh();
    }

    /**
     * Mark payroll as paid.
     */
    public function markPaid(Payroll $payroll, ?string $paidDate = null): Payroll
    {
        if ($payroll->status === 'paid') {
            throw new \Exception('This payroll is already marked as paid.');
        }

        $payroll->update([
            'status' => 'paid',
            'paid_date' => $paidDate ?? now()->toDateString(),
        ]);

        return $payroll->fresh();
    }

    /**
     * Get payrolls for listing.
     */
    public function getPayrolls(array $filters = [])
    {
        $query = Payroll::with('user')->orderByDesc('month');

        if (!empty($filters['month'])) {
            $query->where('month', $filters['month']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }
}
