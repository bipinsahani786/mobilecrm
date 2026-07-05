<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Models\Business;
use App\Models\Commission;
use App\Models\Lead;
use App\Models\Partner;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

class SuperadminDashboardController extends BaseController
{
    #[OA\Get(
        path: '/superadmin/dashboard/stats',
        summary: 'Get Superadmin Dashboard Statistics',
        description: 'Retrieves overall dashboard KPIs, revenue analytics, lead pipelines, best performers, and upcoming renewals.',
        tags: ['Superadmin - Dashboard'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'from_date', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'to_date', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function stats(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        // Parse dates if provided
        $start = $fromDate ? Carbon::parse($fromDate)->startOfDay() : null;
        $end = $toDate ? Carbon::parse($toDate)->endOfDay() : null;

        // 1. Summary Metrics
        // Total Revenue (sum of amount_paid_by_tenant)
        $revenueQuery = Commission::query();
        if ($start) {
            $revenueQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $revenueQuery->where('created_at', '<=', $end);
        }
        $totalRevenue = (float) $revenueQuery->sum('amount_paid_by_tenant');

        // Commissions Paid (sum of commission_amount where status = paid)
        $commPaidQuery = Commission::query()->where('status', 'paid');
        if ($start) {
            $commPaidQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $commPaidQuery->where('created_at', '<=', $end);
        }
        $commissionsPaid = (float) $commPaidQuery->sum('commission_amount');

        // Commissions Pending (sum of commission_amount where status = pending)
        $commPendingQuery = Commission::query()->where('status', 'pending');
        if ($start) {
            $commPendingQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $commPendingQuery->where('created_at', '<=', $end);
        }
        $commissionsPending = (float) $commPendingQuery->sum('commission_amount');

        // Net Platform Profit (Revenue minus Commissions Paid)
        $netProfit = $totalRevenue - $commissionsPaid;

        // Active Businesses
        $activeBusinessesQuery = Business::query()->where('status', 'active');
        if ($start) {
            $activeBusinessesQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $activeBusinessesQuery->where('created_at', '<=', $end);
        }
        $activeBusinesses = $activeBusinessesQuery->count();

        // Sales Partners
        $partnersQuery = Partner::query();
        if ($start) {
            $partnersQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $partnersQuery->where('created_at', '<=', $end);
        }
        $salesPartners = $partnersQuery->count();

        // Total Platform Users
        $usersQuery = User::query();
        if ($start) {
            $usersQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $usersQuery->where('created_at', '<=', $end);
        }
        $totalUsers = $usersQuery->count();

        // 2. Revenue & Profit Trend (Monthly)
        $commTrendQuery = Commission::query();
        if ($start) {
            $commTrendQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $commTrendQuery->where('created_at', '<=', $end);
        }

        // If no date range specified, default to the last 6 months
        if (!$start && !$end) {
            $trendStart = Carbon::now()->subMonths(5)->startOfMonth();
            $commTrendQuery->where('created_at', '>=', $trendStart);
        } else {
            $trendStart = $start ? $start->copy() : Commission::min('created_at');
            if (!$trendStart) {
                $trendStart = Carbon::now()->subMonths(5)->startOfMonth();
            } else {
                $trendStart = Carbon::parse($trendStart)->startOfMonth();
            }
        }
        $trendEnd = $end ? $end->copy() : Carbon::now()->endOfMonth();

        $commTrend = $commTrendQuery->get();

        $months = [];
        $tempStart = $trendStart->copy();
        while ($tempStart->lte($trendEnd)) {
            $monthKey = $tempStart->format('Y-m');
            $months[$monthKey] = [
                'month' => $tempStart->format('M Y'),
                'revenue' => 0.0,
                'profit' => 0.0,
            ];
            $tempStart->addMonth();
        }

        foreach ($commTrend as $comm) {
            $monthKey = $comm->created_at->format('Y-m');
            if (isset($months[$monthKey])) {
                $months[$monthKey]['revenue'] += (float)$comm->amount_paid_by_tenant;
                $paidComm = $comm->status === 'paid' ? (float)$comm->commission_amount : 0.0;
                $months[$monthKey]['profit'] += ((float)$comm->amount_paid_by_tenant - $paidComm);
            }
        }
        $trend = array_values($months);

        // 3. Profit Distribution
        $profitDistribution = [
            'revenue' => $totalRevenue,
            'commissions' => $commissionsPaid,
            'profit' => $netProfit,
        ];

        // 4. Best Sales Agents (Partners)
        $partners = Partner::withCount([
            'businesses' => function ($q) use ($start, $end) {
                if ($start) $q->where('created_at', '>=', $start);
                if ($end) $q->where('created_at', '<=', $end);
            },
            'leads' => function ($q) use ($start, $end) {
                if ($start) $q->where('created_at', '>=', $start);
                if ($end) $q->where('created_at', '<=', $end);
            }
        ])->get();

        foreach ($partners as $partner) {
            $commQuery = Commission::where('partner_id', $partner->id);
            if ($start) {
                $commQuery->where('created_at', '>=', $start);
            }
            if ($end) {
                $commQuery->where('created_at', '<=', $end);
            }
            $partner->earnings = (float) $commQuery->sum('commission_amount');
        }

        $bestPartners = $partners->sortByDesc('earnings')->take(5)->values()->map(function ($partner) {
            return [
                'id' => $partner->id,
                'name' => $partner->name,
                'company_name' => $partner->company_name,
                'referrals_count' => $partner->businesses_count,
                'leads_count' => $partner->leads_count,
                'earnings' => $partner->earnings,
            ];
        });

        // 5. Best Plans
        $plans = Plan::withCount([
            'businesses' => function ($q) use ($start, $end) {
                $q->where('status', 'active');
                if ($start) $q->where('created_at', '>=', $start);
                if ($end) $q->where('created_at', '<=', $end);
            }
        ])->get();

        $bestPlans = $plans->map(function ($plan) {
            $mrr = (float) $plan->businesses_count * (float) $plan->price_monthly;
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price_monthly' => (float) $plan->price_monthly,
                'price_yearly' => (float) $plan->price_yearly,
                'subscribers_count' => $plan->businesses_count,
                'mrr' => $mrr,
            ];
        })->sortByDesc('subscribers_count')->take(5)->values();

        // 6. Lead Funnel
        $leadQuery = Lead::query();
        if ($start) {
            $leadQuery->where('created_at', '>=', $start);
        }
        if ($end) {
            $leadQuery->where('created_at', '<=', $end);
        }
        $leads = $leadQuery->get();

        $totalLeads = $leads->count();
        $contactedLeads = $leads->whereIn('status', ['contacted', 'converted'])->count();
        $convertedLeads = $leads->where('status', 'converted')->count();

        $contactedRate = $totalLeads ? round(($contactedLeads / $totalLeads) * 100, 1) : 0;
        $conversionRate = $totalLeads ? round(($convertedLeads / $totalLeads) * 100, 1) : 0;

        $leadFunnel = [
            'total' => $totalLeads,
            'contacted' => $contactedLeads,
            'converted' => $convertedLeads,
            'contacted_rate' => $contactedRate,
            'conversion_rate' => $conversionRate,
        ];

        // 7. Expiring Subscriptions
        $expiring = Business::with(['plan', 'partner'])
            ->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '>', Carbon::now())
            ->where('plan_expires_at', '<=', Carbon::now()->addDays(30))
            ->orderBy('plan_expires_at', 'asc')
            ->take(10)
            ->get()
            ->map(function ($biz) {
                return [
                    'id' => $biz->id,
                    'name' => $biz->name,
                    'plan_name' => $biz->plan ? $biz->plan->name : 'N/A',
                    'expires_at' => $biz->plan_expires_at ? $biz->plan_expires_at->toIso8601String() : null,
                    'partner_name' => $biz->partner ? $biz->partner->name : 'Direct',
                ];
            });

        return $this->success([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'commissions_paid' => $commissionsPaid,
                'commissions_pending' => $commissionsPending,
                'net_profit' => $netProfit,
                'active_businesses' => $activeBusinesses,
                'sales_partners' => $salesPartners,
                'total_users' => $totalUsers,
            ],
            'trend' => $trend,
            'profit_distribution' => $profitDistribution,
            'best_partners' => $bestPartners,
            'best_plans' => $bestPlans,
            'lead_funnel' => $leadFunnel,
            'expiring_subscriptions' => $expiring,
        ], 'Dashboard statistics retrieved successfully');
    }
}
