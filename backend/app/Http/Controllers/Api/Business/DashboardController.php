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
        $todaySales = Sale::whereDate('date', $today)->sum('final_amount');

        // 2. This Month's Revenue
        $monthlyRevenue = Sale::where('date', '>=', $thisMonth)->sum('final_amount');

        // 3. Pending Payments (Expected)
        $pendingPayments = Sale::whereIn('status', ['pending', 'partial'])->sum('final_amount') 
                         - Sale::whereIn('status', ['pending', 'partial'])->sum('paid_amount');

        // 4. Staff Attendance (Today)
        $activeStaffCount = User::whereHas('businesses', function($q) {
            $q->where('business_id', app('current_business_id'));
        })->where('status', 'active')->count();

        $presentToday = Attendance::whereDate('date', $today)
            ->whereIn('status', ['present', 'half_day'])
            ->count();

        // 5. Recent Sales (Last 5)
        $recentSales = Sale::with(['customer', 'user'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'today_sales' => $todaySales,
                'monthly_revenue' => $monthlyRevenue,
                'pending_payments' => $pendingPayments,
                'staff' => [
                    'active' => $activeStaffCount,
                    'present_today' => $presentToday,
                ],
                'recent_sales' => $recentSales,
            ]
        ]);
    }
}
