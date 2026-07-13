import React from 'react';
import { useExpenseAnalytics } from '../api/useExpenses';
import { Wallet, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { formatCurrency } from '@/lib/formatters';

export const ExpenseAnalytics = ({ onRecordExpense }: { onRecordExpense?: () => void }) => {
  const { data: analytics, isLoading } = useExpenseAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-5xl">
            <Skeleton className="h-[110px] rounded-2xl" />
            <Skeleton className="h-[110px] rounded-2xl" />
            <Skeleton className="h-[110px] rounded-2xl" />
          </div>
          <div className="w-36 h-12 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-5xl">
          {/* Card 1: This Month */}
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="This Month"
              value={formatCurrency(analytics.total_this_month)}
              icon={<Wallet />}
              glowColor="primary"
              subtitle={`${analytics.percent_change <= 0 ? '' : '+'}${Math.round(analytics.percent_change)}% vs last month`}
            />
          </div>

          {/* Card 2: Top Category */}
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Top Category"
              value={topCategory}
              icon={<PieChartIcon />}
              glowColor="primary"
              subtitle="Highest expense segment"
            />
          </div>

          {/* Card 3: All Time Spend */}
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
        <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
          <button 
            onClick={onRecordExpense}
            className="group relative flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 relative z-10"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            <span className="relative z-10">Add Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
};
