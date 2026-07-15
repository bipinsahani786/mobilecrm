import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Activity, Eye, FileText, Calendar, IndianRupee } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useStaffPerformance } from '../api/useStaffPerformance';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';

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
      accessor: 'name',
    },
    {
      header: 'Total Sales (Qty)',
      accessor: (row: any) => row.total_sales.toString(),
    },
    {
      header: 'Sales Amount (Revenue)',
      accessor: (row: any) => `₹${row.total_sales_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'Total Profit',
      accessor: (row: any) => `₹${row.total_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'Commission Base',
      accessor: (row: any) => <span className="capitalize px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{row.commission_base}</span>,
    },
    {
      header: 'Commission Rate',
      accessor: (row: any) => `${row.commission_rate}%`,
    },
    {
      header: 'Calculated Commission',
      accessor: (row: any) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          ₹{row.calculated_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(row)}>
          <Eye className="w-4 h-4 mr-2" /> View Products
        </Button>
      ),
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Activity}
        title="Staff Performance & Commission"
        subtitle="Track sales, profit, and commissions for all your staff members"
        actions={
          <div className="flex items-center gap-2">
            <CustomSelect
              value={dateRange}
              onChange={(value) => setDateRange(value)}
              className="w-40"
              options={[
                { value: 'this_week', label: 'This Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
                { value: 'this_year', label: 'This Year' },
              ]}
            />
          </div>
        }
      />

      <div className="w-full max-w-[1600px] px-4 pt-0 pb-4 space-y-4 flex-1">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Sales Invoices */}
          <div className="group relative bg-white dark:bg-[#111115] border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-violet-500/40 dark:hover:border-violet-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Background Glow Shades & Shapes */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-violet-500/10 blur-xl pointer-events-none group-hover:bg-violet-500/20 group-hover:scale-150 transition-all duration-500" />
            <div className="absolute -left-6 -top-6 w-12 h-12 rounded-full bg-violet-500/5 blur-lg pointer-events-none group-hover:scale-125 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sales Invoices</span>
              <div className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300 font-display">
                {data?.reduce((acc: number, cur: any) => acc + cur.total_sales, 0) || 0}
              </div>
              <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Invoices in period</p>
            </div>
          </div>
          
          {/* Card 2: Total Revenue */}
          <div className="group relative bg-white dark:bg-[#111115] border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary-500/40 dark:hover:border-primary-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Background Glow Shades & Shapes */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-primary-500/10 blur-xl pointer-events-none group-hover:bg-primary-500/20 group-hover:scale-150 transition-all duration-500" />
            <div className="absolute -left-6 -top-6 w-12 h-12 rounded-full bg-primary-500/5 blur-lg pointer-events-none group-hover:scale-125 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Revenue</span>
              <div className="p-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 font-display">
                ₹{data?.reduce((acc: number, cur: any) => acc + cur.total_sales_amount, 0).toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}
              </div>
              <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Gross billing amount</p>
            </div>
          </div>
          
          {/* Card 3: Total Profit */}
          <div className="group relative bg-white dark:bg-[#111115] border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Background Glow Shades & Shapes */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 group-hover:scale-150 transition-all duration-500" />
            <div className="absolute -left-6 -top-6 w-12 h-12 rounded-full bg-emerald-500/5 blur-lg pointer-events-none group-hover:scale-125 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Profit</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 font-display">
                ₹{data?.reduce((acc: number, cur: any) => acc + cur.total_profit, 0).toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}
              </div>
              <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Net earnings from sales</p>
            </div>
          </div>

          {/* Card 4: Total Commission Paid */}
          <div className="group relative bg-white dark:bg-[#111115] border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Background Glow Shades & Shapes */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-rose-500/10 blur-xl pointer-events-none group-hover:bg-rose-500/20 group-hover:scale-150 transition-all duration-500" />
            <div className="absolute -left-6 -top-6 w-12 h-12 rounded-full bg-rose-500/5 blur-lg pointer-events-none group-hover:scale-125 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Commission</span>
              <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-300 font-display">
                ₹{data?.reduce((acc: number, cur: any) => acc + cur.calculated_commission, 0).toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}
              </div>
              <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Commissions paid/accrued</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={data || []} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <Modal 
        isOpen={!!selectedStaff} 
        onClose={() => setSelectedStaff(null)} 
        title={`Products Sold by ${selectedStaff?.name}`}
        maxWidth="lg"
      >
        {selectedStaff && (
          <div className="p-4">
             {selectedStaff.products_sold?.length > 0 ? (
                <div className="border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product Name</th>
                                <th className="px-4 py-3 font-medium">Qty Sold</th>
                                <th className="px-4 py-3 font-medium">Total Sale</th>
                                <th className="px-4 py-3 font-medium">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {selectedStaff.products_sold.map((product: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3">{product.name}</td>
                                    <td className="px-4 py-3">{product.quantity}</td>
                                    <td className="px-4 py-3">₹{product.total_sale.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3">₹{product.total_profit.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-8 text-slate-500">
                    No products sold by this staff member in the selected period.
                </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
}
