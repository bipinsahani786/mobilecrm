import React from 'react';
import { useExpenseAnalytics } from '../api/useExpenses';
import { StatCard } from '@/components/ui/stat-card';
import { Wallet, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#fe7d02', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ExpenseAnalytics = () => {
  const { data: analytics, isLoading } = useExpenseAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-[110px] rounded-xl" />
        <Skeleton className="h-[110px] rounded-xl" />
        <Skeleton className="h-[110px] rounded-xl" />
      </div>
    );
  }

  if (!analytics) return null;

  const topCategory = analytics.category_breakdown && analytics.category_breakdown.length > 0
    ? analytics.category_breakdown[0].name
    : 'No Data';

  const chartData = analytics.category_breakdown?.map((item: any) => ({
    name: item.name,
    value: Number(item.value)
  })) || [];

  return (
    <div className="space-y-6 mb-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="This Month"
          value={`₹${analytics.total_this_month.toLocaleString()}`}
          icon={Wallet}
          trend={{
            value: `${Math.abs(analytics.percent_change)}%`,
            isPositive: analytics.percent_change <= 0 // Less expenses is positive!
          }}
          subtext="vs Last Month"
          color="bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
        />
        <StatCard
          title="Top Category (This Month)"
          value={topCategory}
          icon={PieChartIcon}
          subtext="Highest spend category"
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          title="All Time Expenses"
          value={`₹${analytics.total_all_time.toLocaleString()}`}
          icon={TrendingUp}
          subtext="Total lifetime spend"
          color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
      </div>

      {/* Charts Row */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
            Expense Breakdown (This Month)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
