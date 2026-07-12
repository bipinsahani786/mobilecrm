import React from 'react';
import { useExpenseAnalytics } from '../api/useExpenses';
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

export const ExpenseAnalytics = ({ onRecordExpense }: { onRecordExpense?: () => void }) => {
  const { data: analytics, isLoading } = useExpenseAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Skeleton className="h-[110px] rounded-sm" />
        <Skeleton className="h-[110px] rounded-sm" />
        <Skeleton className="h-[110px] rounded-sm" />
        <Skeleton className="h-[110px] rounded-sm" />
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
      {/* Stat Cards Row */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1 */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-sm p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-slate-500/10 transition-all duration-500" />
          <div className="absolute -bottom-8 -right-8 w-24 h-24 border border-slate-500/10 rounded-[40%] rotate-45 group-hover:rotate-[90deg] group-hover:scale-125 transition-all duration-700 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Wallet className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${analytics.percent_change <= 0 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {analytics.percent_change <= 0 ? '-' : '+'}{Math.abs(analytics.percent_change)}%
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5 relative z-10">This Month</h3>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">₹{analytics.total_this_month.toLocaleString()}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-sm p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-slate-500/10 transition-all duration-500" />
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-tr from-slate-500/5 to-transparent rounded-full group-hover:scale-[2] transition-all duration-700 pointer-events-none opacity-50" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <PieChartIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5 relative z-10">Top Category</h3>
          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate relative z-10">{topCategory}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-sm p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-slate-500/10 transition-all duration-500" />
          <div className="absolute bottom-4 right-4 w-32 h-0 border-t-2 border-dashed border-slate-500/10 -rotate-12 group-hover:rotate-0 group-hover:-translate-y-8 group-hover:scale-125 transition-all duration-700 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5 relative z-10">All Time Spend</h3>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">₹{analytics.total_all_time.toLocaleString()}</p>
        </div>

        {/* Card 4: Action Button */}
        <button 
          onClick={onRecordExpense}
          className="w-full h-full text-left bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-sm p-4 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-white/20 transition-all duration-500" />
          
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <div>
              <h3 className="text-primary-50 text-[9px] font-black uppercase tracking-widest mb-0.5 drop-shadow-sm">Quick Action</h3>
              <p className="text-lg font-black text-white tracking-tight drop-shadow-md">Record Expense</p>
            </div>
          </div>
        </button>
      </div>

      {/* Charts Row */}
      <div className="lg:col-span-5 flex flex-col h-full">
        {chartData.length > 0 ? (
          <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-sm p-4 shadow-sm relative overflow-hidden group flex-1 flex flex-col">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-slate-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-slate-500" />
              Expense Breakdown
            </h3>
            <div className="flex-1 w-full relative z-10 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-slate-900)' }}
                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-sm p-4 shadow-sm flex items-center justify-center h-full text-xs text-slate-500 font-bold uppercase tracking-widest">
            No Expense Data
          </div>
        )}
      </div>
    </div>
  );
};
