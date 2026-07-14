import React from 'react';
import { useExpenseAnalytics } from '../api/useExpenses';
import { Wallet, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { formatCurrency } from '@/lib/formatters';

export const ExpenseAnalytics = ({ onRecordExpense, dateFilter = 'all' }: { onRecordExpense?: () => void, dateFilter?: string }) => {
  const { data: analytics, isLoading } = useExpenseAnalytics(dateFilter);

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <Skeleton className="h-[88px] rounded-2xl" />
            <Skeleton className="h-[88px] rounded-2xl" />
            <Skeleton className="h-[88px] rounded-2xl" />
            <Skeleton className="h-[88px] rounded-2xl" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="w-36 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const topCategory = analytics.category_breakdown && analytics.category_breakdown.length > 0
    ? analytics.category_breakdown[0].name
    : 'No Data';

  return (
    <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* KPI Cards (1x4 Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Today's Expense"
              value={formatCurrency(analytics.total_today || 0)}
              icon={<Wallet />}
              glowColor="primary"
              subtitle="Expenses incurred today"
            />
          </div>
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="This Month"
              value={formatCurrency(analytics.total_this_month)}
              icon={<Wallet />}
              glowColor="primary"
              subtitle={`${analytics.percent_change <= 0 ? '' : '+'}${Math.round(analytics.percent_change)}% vs last month`}
            />
          </div>
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Top Category"
              value={topCategory}
              icon={<PieChartIcon />}
              glowColor="primary"
              subtitle="Highest expense segment"
            />
          </div>
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="All Time Spend"
              value={formatCurrency(analytics.total_all_time)}
              icon={<TrendingUp />}
              glowColor="primary"
              subtitle="Cumulative expenses"
            />
          </div>
        </div>

        {/* Action Button: Record Expense */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <button 
            onClick={onRecordExpense}
            className="group relative flex items-center justify-center gap-2 px-5 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            <span className="font-semibold text-sm">Add Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
};
