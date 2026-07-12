import React, { useState } from 'react';
import { usePayrolls, useConfirmPayroll, useMarkPayrollPaid } from '../api/usePayroll';
import { PageHeader } from '@/components/layout/PageHeader';
import { IndianRupee, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format, subMonths } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { PayrollGenerateModal } from '../components/PayrollGenerateModal';
import { getPayrollColumns } from '../constants/payrollColumns';

export default function PayrollPage() {
  const navigate = useNavigate();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const { data: payrollsData, isLoading } = usePayrolls({ month: selectedMonth });
  const confirmMutation = useConfirmPayroll();
  const markPaidMutation = useMarkPayrollPaid();

  const columns = getPayrollColumns({ confirmMutation, markPaidMutation, navigate });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={IndianRupee}
        title="Payroll Processing" 
        subtitle="Manage employee salaries, commissions, and deductions"
        actions={
          <Button size="sm" onClick={() => setIsGenerateOpen(true)}>
            <Clock size={14} className="mr-2" /> Generate Payroll
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Filters */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex gap-4 items-end">
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Select Month</label>
            <Input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
            />
          </div>
          <div className="flex gap-2 pb-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(currentMonth)}
              className={selectedMonth === currentMonth ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-primary-200' : ''}
            >
              This Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(lastMonth)}
              className={selectedMonth === lastMonth ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-primary-200' : ''}
            >
              Last Month
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
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
