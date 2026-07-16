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
}
