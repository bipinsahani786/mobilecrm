import React, { useState, useMemo } from 'react';
import { usePayrolls, useConfirmPayroll, useMarkPayrollPaid } from '../api/usePayroll';
import { PageHeader } from '@/components/layout/PageHeader';
import { IndianRupee, FileText, CheckCircle, Clock, Download, Plus, Search, HelpCircle, ShieldAlert, BadgeDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { PayrollGenerateModal } from '../components/PayrollGenerateModal';
import { getPayrollColumns } from '../constants/payrollColumns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterContainer, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { useStaff } from '../../staff/api/useStaff';
import { formatCurrency } from '@/lib/formatters';

export default function PayrollPage() {
  const navigate = useNavigate();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const { data: staffList } = useStaff();

  const queryFilters: any = { month: selectedMonth };
  if (selectedStaff !== 'all') {
    queryFilters.user_id = selectedStaff;
  }
  if (selectedStatus !== 'all') {
    queryFilters.status = selectedStatus;
  }

  const { data: payrollsData, isLoading } = usePayrolls(queryFilters);
  const confirmMutation = useConfirmPayroll();
  const markPaidMutation = useMarkPayrollPaid();

  const columns = getPayrollColumns({ confirmMutation, markPaidMutation, navigate });

  // Compute local KPI statistics based on current month's payrolls
  const stats = useMemo(() => {
    const list = payrollsData?.data || [];
    const totalExpense = list.reduce((sum: number, r: any) => sum + (parseFloat(r.final_salary) || 0), 0);
    const draftCount = list.filter((r: any) => r.status === 'draft').length;
    const confirmedCount = list.filter((r: any) => r.status === 'confirmed').length;
    const paidCount = list.filter((r: any) => r.status === 'paid').length;

    return {
      totalExpense,
      draftCount,
      confirmedCount,
      paidCount,
      totalCount: list.length
    };
  }, [payrollsData]);

  const handleClearFilters = () => {
    setSelectedMonth(currentMonth);
    setSelectedStaff('all');
    setSelectedStatus('all');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={IndianRupee}
        title="Payroll Processing" 
        subtitle="Manage employee salaries, commissions, and deductions"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Analytics Section (Full Width Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Total Payroll Cost"
              value={formatCurrency(stats.totalExpense)}
              icon={<BadgeDollarSign size={18} />}
              glowColor="primary"
              subtitle="Sum of final salaries"
            />
          </div>

          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Paid Payrolls"
              value={stats.paidCount}
              icon={<CheckCircle size={18} />}
              glowColor="primary"
              subtitle="Successfully disbursed"
            />
          </div>

          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Awaiting Confirmation"
              value={stats.draftCount}
              icon={<Clock size={18} />}
              glowColor="primary"
              subtitle="Draft status records"
            />
          </div>

          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Pending Payment"
              value={stats.confirmedCount}
              icon={<ShieldAlert size={18} />}
              glowColor="primary"
              subtitle="Confirmed, unpaid records"
            />
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="w-full bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          
          {/* Row 1: Filters */}
          <div className="flex flex-wrap items-end gap-4 w-full">
            
            {/* Month Input */}
            <div className="w-full sm:w-52 shrink-0">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                Select Month
              </label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              />
            </div>

            {/* Quick Month Shortcuts */}
            <div className="flex gap-1.5 shrink-0 h-10 items-center">
              <button 
                onClick={() => setSelectedMonth(currentMonth)}
                className={`h-9 px-3 rounded-lg text-xs font-black uppercase tracking-widest border transition-all duration-250 cursor-pointer ${selectedMonth === currentMonth ? 'bg-primary-500/10 text-primary-500 border-primary-500/30' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
              >
                This Month
              </button>
              <button 
                onClick={() => setSelectedMonth(lastMonth)}
                className={`h-9 px-3 rounded-lg text-xs font-black uppercase tracking-widest border transition-all duration-250 cursor-pointer ${selectedMonth === lastMonth ? 'bg-primary-500/10 text-primary-500 border-primary-500/30' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
              >
                Last Month
              </button>
            </div>

            {/* Staff Selector */}
            <div className="w-full sm:w-56 shrink-0">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                Staff Member
              </label>
              <FilterSelect
                value={selectedStaff}
                onChange={setSelectedStaff}
                placeholder="All Staff"
                options={[
                  { value: 'all', label: 'All Staff' },
                  ...(staffList?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [])
                ]}
                wrapperClassName="w-full"
              />
            </div>

            {/* Status Selector */}
            <div className="w-full sm:w-48 shrink-0">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                Status
              </label>
              <FilterSelect
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="All Statuses"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'paid', label: 'Paid' }
                ]}
                wrapperClassName="w-full"
              />
            </div>

          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

          {/* Row 2: Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsGenerateOpen(true)}
                className="group relative flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Generate Payroll</span>
              </button>

              {/* Reset Button */}
              {(selectedStaff !== 'all' || selectedStatus !== 'all' || selectedMonth !== currentMonth) && (
                <FilterReset
                  onClick={handleClearFilters}
                  className="ml-0 h-10 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800"
                />
              )}
            </div>

            <div className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {stats.totalCount} Payroll records retrieved
            </div>
          </div>

        </div>

        {/* Payroll Table */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm">
          <DataTable 
            columns={columns} 
            data={payrollsData?.data || []} 
            isLoading={isLoading}
            onRowClick={(row: any) => navigate(`/payroll/${row.id}`)}
          />
        </div>

      </div>

      <PayrollGenerateModal 
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        defaultMonth={selectedMonth}
      />
    </div>
  );
}
