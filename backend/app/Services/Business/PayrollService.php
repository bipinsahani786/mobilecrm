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
     * Supports both 'monthly' and 'daily' salary types.
     */
    public function generateForEmployee(int $userId, string $month): Payroll
    {
        $businessId = app('current_business_id');

        // Normalize month format to YYYY-MM
        $month = Carbon::createFromFormat('Y-m', $month)->format('Y-m');

        return DB::transaction(function () use ($userId, $month, $businessId) {

            // Check if payroll already exists (lock row to prevent race condition)
            $existing = Payroll::where('user_id', $userId)
                ->where('month', $month)
                ->lockForUpdate()
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

            $salaryType = $staffData->salary_type ?? 'monthly';

            // Parse month to get date range
            $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $endOfMonth = $startOfMonth->copy()->endOfMonth();
            $totalDaysInMonth = $endOfMonth->day;

            // Effective end date: min(today, end_of_month) — prevents future days from being counted as absent
            $today = Carbon::today();
            $effectiveEndDate = $today->lessThan($endOfMonth) && $today->greaterThanOrEqualTo($startOfMonth)
                ? $today
                : $endOfMonth;

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

            // Calculate paid leaves quota — explicitly scoped to this business
            $paidLeaveQuota = LeavePolicy::withoutGlobalScopes()
                ->where('business_id', $businessId)
                ->where('is_paid', true)
                ->sum('monthly_quota');
            $paidLeaves = min($leaveDays, (int) $paidLeaveQuota);
            $unpaidLeaves = max(0, $leaveDays - $paidLeaves);

            // Commission for this month (use sale relationship date for accuracy)
            $totalCommission = SaleCommission::where('user_id', $userId)
                ->where(function ($q) use ($startOfMonth, $endOfMonth) {
                    $q->whereHas('sale', function ($sq) use ($startOfMonth, $endOfMonth) {
                        $sq->whereBetween('created_at', [$startOfMonth, $endOfMonth->endOfDay()]);
                    })->orWhereBetween('created_at', [$startOfMonth, $endOfMonth->endOfDay()]);
                })
                ->sum('commission_amount');

            // Advance deductions
            $advanceDeduction = SalaryAdvance::where('user_id', $userId)
                ->where('deduct_in_month', $month)
                ->where('is_deducted', false)
                ->where('status', 'approved')
                ->sum('amount');

            // ── DAILY SALARY TYPE ──────────────────────────────────────────
            if ($salaryType === 'daily') {
                $dailyRate = (float) ($staffData->daily_salary ?? 0);

                // Daily staff gets paid only for present days (+ half_day as 0.5 + paid_leaves)
                $effectivePresent = $presentDays + ($halfDays * 0.5) + $paidLeaves;
                $baseSalary = round($effectivePresent * $dailyRate, 2);
                $perDaySalary = $dailyRate;
                $deduction = 0; // No LOP deduction for daily — they simply don't get paid for absent days

                // Working days for reference (total days minus week_offs and holidays)
                $workingDays = $totalDaysInMonth - $weekOffs - $holidays;
                if ($workingDays <= 0)
                    $workingDays = $totalDaysInMonth;
                $finalSalary = $baseSalary + (float) $totalCommission - (float) $advanceDeduction;

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
                    'deduction' => 0,
                    'total_commission' => (float) $totalCommission,
                    'bonus' => $existing ? $existing->bonus : 0,
                    'advance_deduction' => (float) $advanceDeduction,
                    'salary_components' => json_encode([]),
                    'salary_type' => 'daily',
                    'final_salary' => round($finalSalary, 2),
                    'status' => 'draft',
                ];

                if ($existing) {
                    $payrollData['bonus'] = $existing->bonus;
                    $payrollData['final_salary'] = round($finalSalary + $existing->bonus, 2);
                    $existing->update($payrollData);
                    return $existing->fresh();
                }

                return Payroll::create($payrollData);
            }

            // ── MONTHLY SALARY TYPE ────────────────────────────────────────
            $components = $staffData->salary_components
                ? json_decode($staffData->salary_components, true)
                : [];

            $totalEarnings = 0;
            $totalComponentDeductions = 0;

            if (is_array($components)) {
                foreach ($components as $comp) {
                    if (is_array($comp) && isset($comp['type']) && isset($comp['amount'])) {
                        if ($comp['type'] === 'earning') {
                            $totalEarnings += (float) $comp['amount'];
                        } else if ($comp['type'] === 'deduction') {
                            $totalComponentDeductions += (float) $comp['amount'];
                        }
                    }
                }
            }

            // If no components array format found, fallback to monthly_salary
            if ($totalEarnings === 0 && $staffData->monthly_salary > 0) {
                $totalEarnings = (float) $staffData->monthly_salary;
            }

            $baseSalary = $totalEarnings - $totalComponentDeductions;

            // Working days = total days in month - week_offs - holidays
            $workingDays = $totalDaysInMonth - $weekOffs - $holidays;
            if ($workingDays <= 0)
                $workingDays = $totalDaysInMonth;

            $perDaySalary = $baseSalary / $workingDays;

            // Effective attendance = present + (half_days × 0.5) + paid_leaves
            $effectivePresent = $presentDays + ($halfDays * 0.5) + $paidLeaves;

            // ── Mid-month fix ──
            // Only count elapsed working days for deduction (don't count future days as absent)
            $elapsedDays = $effectiveEndDate->day;
            // Count week_offs and holidays that have actually passed (from attendance records up to effective end date)
            $elapsedAttendances = $attendances->filter(function ($a) use ($effectiveEndDate) {
                return Carbon::parse($a->date)->lessThanOrEqualTo($effectiveEndDate);
            });
            $elapsedWeekOffs = $elapsedAttendances->where('status', 'week_off')->count();
            $elapsedHolidays = $elapsedAttendances->where('status', 'holiday')->count();
            $elapsedWorkingDays = $elapsedDays - $elapsedWeekOffs - $elapsedHolidays;
            if ($elapsedWorkingDays <= 0) $elapsedWorkingDays = $elapsedDays;

            // Deduction based only on elapsed working days (not full month)
            $unpaidAbsences = max(0, $elapsedWorkingDays - $effectivePresent);
            $deduction = $unpaidAbsences * $perDaySalary;

            // Final salary
            $finalSalary = $baseSalary - $deduction + (float) $totalCommission - (float) $advanceDeduction;

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
                'salary_type' => 'monthly',
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

        }); // end DB::transaction
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
