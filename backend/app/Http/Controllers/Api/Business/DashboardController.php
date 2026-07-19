<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // 1. Today's Sales
        $todaySales = Sale::whereDate('date', $today)
            ->where('invoice_number', 'not like', 'UDH-%')
            ->sum('final_amount');

        // 2. This Month's Revenue
        $monthlyRevenue = Sale::where('date', '>=', $thisMonth)
            ->where('invoice_number', 'not like', 'UDH-%')
            ->sum('final_amount');

        // 3. Pending Payments (Expected)
        $pendingPayments = Sale::whereIn('status', ['pending', 'partial'])
                            ->where('invoice_number', 'not like', 'UDH-%')
                            ->sum('final_amount') 
                         - Sale::whereIn('status', ['pending', 'partial'])
                            ->where('invoice_number', 'not like', 'UDH-%')
                            ->sum('paid_amount');

        // 4. Staff Attendance (Today)
        $activeStaffCount = User::whereHas('businesses', function($q) {
            $q->where('business_id', app('current_business_id'));
        })->where('status', 'active')->count();

        $presentToday = Attendance::whereDate('date', $today)
            ->whereIn('status', ['present', 'half_day'])
            ->count();

        // 5. Recent Sales (Last 5)
        $recentSales = Sale::with(['customer', 'user'])
            ->where('invoice_number', 'not like', 'UDH-%')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // 6. This Month's Expenses
        $monthlyExpenses = \App\Models\Expense::where('expense_date', '>=', $thisMonth)
            ->sum('amount');

        // 7. Total Invoices This Month
        $totalInvoices = Sale::where('date', '>=', $thisMonth)
            ->where('invoice_number', 'not like', 'UDH-%')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'today_sales' => $todaySales,
                'monthly_revenue' => $monthlyRevenue,
                'monthly_expenses' => $monthlyExpenses,
                'pending_payments' => $pendingPayments,
                'total_invoices' => $totalInvoices,
                'staff' => [
                    'active' => $activeStaffCount,
                    'present_today' => $presentToday,
                ],
                'recent_sales' => $recentSales,
            ]
        ]);
    }

    public function staffEarnings(Request $request)
    {
        $user = $request->user();
        $businessId = app('current_business_id');
        $month = Carbon::now()->format('Y-m');

        // Get staff salary type from pivot
        $staffData = \Illuminate\Support\Facades\DB::table('business_user')
            ->where('business_id', $businessId)
            ->where('user_id', $user->id)
            ->first();

        $salaryType = $staffData->salary_type ?? 'monthly';

        // Use PayrollService to calculate the draft payroll for this month
        $payrollService = app(\App\Services\Business\PayrollService::class);
        $draftPayroll = $payrollService->generateForEmployee($user->id, $month);

        $today = Carbon::today();
        
        // 1. Today's Earnings
        $todayAttendance = Attendance::where('user_id', $user->id)
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

        // 2. This Month's Earnings
        if ($salaryType === 'daily') {
            // Daily staff: base_salary already = present_days × daily_rate
            $monthlyEarnings = $draftPayroll->base_salary + $draftPayroll->total_commission;
            $draftDues = $monthlyEarnings - $draftPayroll->advance_deduction;
        } else {
            // Monthly staff: calculate EXACT earned amount till date
            $effectivePresent = $draftPayroll->present_days + ($draftPayroll->half_days * 0.5) + $draftPayroll->paid_leaves;
            $earnedBaseTillDate = $effectivePresent * $draftPayroll->per_day_salary;
            $monthlyEarnings = $earnedBaseTillDate + $draftPayroll->total_commission;
            $draftDues = $monthlyEarnings - $draftPayroll->advance_deduction;
        }

        // 3. Advance Taken This Month
        $advanceTaken = $draftPayroll->advance_deduction;

        // 4. Total Unpaid Dues
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
    }
}
