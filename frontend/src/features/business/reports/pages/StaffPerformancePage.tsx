import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Activity, Eye, FileText, Calendar, IndianRupee } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useStaffPerformance } from '../api/useStaffPerformance';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';

export default function StaffPerformancePage() {
  const [dateRange, setDateRange] = useState('this_month');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const getDates = () => {
    const today = new Date();
    if (dateRange === 'this_week') {
      return {
        from_date: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        to_date: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      };
    }
    if (dateRange === 'last_month') {
      const lastMonth = subMonths(today, 1);
      return {
        from_date: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        to_date: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
      };
    }
    if (dateRange === 'this_year') {
      return {
        from_date: format(startOfYear(today), 'yyyy-MM-dd'),
        to_date: format(endOfYear(today), 'yyyy-MM-dd')
      };
    }
    // this_month
    return {
      from_date: format(startOfMonth(today), 'yyyy-MM-dd'),
      to_date: format(endOfMonth(today), 'yyyy-MM-dd')
    };
  };

  const { from_date, to_date } = getDates();
  const { data, isLoading } = useStaffPerformance({ from_date, to_date });

  const columns = [
    {
      header: 'Staff Name',
      accessorKey: 'name',
    },
    {
      header: 'Total Sales (Qty)',
      cell: (row: any) => row.total_sales.toString(),
    },
    {
      header: 'Sales Amount (Revenue)',
      cell: (row: any) => `₹${row.total_sales_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'Total Profit',
      cell: (row: any) => `₹${row.total_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'Commission Base',
      cell: (row: any) => <span className="capitalize px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{row.commission_base}</span>,
    },
    {
      header: 'Commission Rate',
      cell: (row: any) => `${row.commission_rate}%`,
    },
    {
      header: 'Calculated Commission',
      cell: (row: any) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          ₹{row.calculated_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Details',
      cell: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(row)}>
          <Eye className="w-4 h-4 mr-2" /> View Products
        </Button>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      
      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-violet-500/10 dark:bg-violet-500/25 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <PageHeader 
          icon={Activity}
          title="Staff Performance & Commission"
          subtitle="Track sales, profit, and commissions for all your staff members"
        />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <CustomKpiCard
              title="Sales Invoices"
              value={data?.reduce((acc: number, cur: any) => acc + cur.total_sales, 0) || 0}
              subtitle="Invoices in period"
              icon={<FileText />}
              glowColor="indigo"
            />
            <CustomKpiCard
              title="Total Revenue"
              value={`₹${data?.reduce((acc: number, cur: any) => acc + cur.total_sales_amount, 0).toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}`}
              subtitle="Gross billing amount"
              icon={<IndianRupee />}
              glowColor="primary"
            />
            <CustomKpiCard
              title="Total Profit"
              value={`₹${data?.reduce((acc: number, cur: any) => acc + cur.total_profit, 0).toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}`}
              subtitle="Net earnings from sales"
              icon={<Activity />}
              glowColor="emerald"
            />
            <CustomKpiCard
              title="Total Commission"
              value={`₹${data?.reduce((acc: number, cur: any) => acc + cur.calculated_commission, 0).toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}`}
              subtitle="Commissions paid/accrued"
              icon={<IndianRupee />}
              glowColor="rose"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Filter Period</span>
              <CustomSelect
                value={dateRange}
                onChange={(value) => setDateRange(value)}
                className="w-44"
                options={[
                  { value: 'this_week', label: 'This Week' },
                  { value: 'this_month', label: 'This Month' },
                  { value: 'last_month', label: 'Last Month' },
                  { value: 'this_year', label: 'This Year' },
                ]}
              />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
            <DataTable 
              columns={columns} 
              data={data || []} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedStaff} 
        onClose={() => setSelectedStaff(null)} 
        title={`Products Sold by ${selectedStaff?.name}`}
        maxWidth="lg"
      >
        {selectedStaff && (
          <div className="p-5">
             {selectedStaff.products_sold?.length > 0 ? (
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/10">
                            <tr>
                                <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">Product Name</th>
                                <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">Qty Sold</th>
                                <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">Total Sale</th>
                                <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 dark:divide-white/5 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300">
                            {selectedStaff.products_sold.map((product: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/55 dark:hover:bg-white/[0.02] transition-colors duration-150">
                                    <td className="px-5 py-3.5 font-medium">{product.name}</td>
                                    <td className="px-5 py-3.5 font-bold">{product.quantity}</td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">₹{product.total_sale.toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">₹{product.total_profit.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-10 text-slate-500 font-medium">
                    No products sold by this staff member in the selected period.
                </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
}
