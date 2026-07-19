import { Badge } from '@/components/ui/badge';
import { FileText, CheckSquare, CheckCircle2 } from 'lucide-react';
import React from 'react';
import type { PayrollRecord } from '../api/usePayroll';

interface PayrollColumnActions {
  confirmMutation: any;
  markPaidMutation: any;
  navigate: any;
  isManager: boolean;
  viewMode?: 'earned' | 'projected';
}

export const getPayrollColumns = ({ confirmMutation, markPaidMutation, navigate, isManager, viewMode = 'projected' }: PayrollColumnActions): any[] => [
  {
    header: 'Staff Member',
    accessorKey: 'user.name',
    cell: (row: PayrollRecord) => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-xs text-slate-900 dark:text-white">
          {row.user?.name}
        </span>
        {(row as any).salary_type === 'daily' && (
          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Per Day
          </span>
        )}
      </div>
    )
  },
  {
    header: 'Base Salary',
    accessorKey: 'base_salary',
    cell: (row: PayrollRecord) => {
      const isDraft = row.status === 'draft';
      const isMonthly = (row as any).salary_type !== 'daily';
      
      let displayBase = Number(row.base_salary);
      if (isDraft && isMonthly && viewMode === 'earned') {
        const perDaySalary = Number((row as any).per_day_salary || 0);
        const effectivePresent = Number(row.present_days || 0) + (Number(row.half_days || 0) * 0.5) + Number(row.paid_leaves || 0);
        displayBase = effectivePresent * perDaySalary;
      }
      return `₹${displayBase.toLocaleString()}`;
    }
  },
  {
    header: 'Attendance',
    accessorKey: 'present_days',
    cell: (row: PayrollRecord) => {
      return (
        <div className="text-sm">
          <span className="text-emerald-600 font-bold text-xs">{row.present_days}P</span> / 
          <span className="text-red-500 font-bold text-xs ml-1">{row.absent_days}A</span>
          <span className="text-slate-500 text-xs ml-1">({row.total_days} days)</span>
        </div>
      );
    }
  },
  {
    header: 'Commission',
    accessorKey: 'total_commission',
    cell: (row: PayrollRecord) => {
      const val = Number(row.total_commission);
      return val > 0 ? <span className="text-emerald-600">+₹{val.toLocaleString()}</span> : '-';
    }
  },
  {
    header: 'Deductions',
    accessorKey: 'deduction',
    cell: (row: PayrollRecord) => {
      const isDraft = row.status === 'draft';
      const isMonthly = (row as any).salary_type !== 'daily';
      
      let displayDeduction = Number((row as any).deduction);
      if (isDraft && isMonthly && viewMode === 'earned') {
        displayDeduction = 0;
      }
      
      const val = displayDeduction + Number((row as any).advance_deduction);
      return val > 0 ? <span className="text-red-500">-₹{val.toLocaleString()}</span> : '-';
    }
  },
  {
    header: 'Final Salary',
    accessorKey: 'final_salary',
    cell: (row: PayrollRecord) => {
      const isDraft = row.status === 'draft';
      const isMonthly = (row as any).salary_type !== 'daily';
      
      let displayNet = Number(row.final_salary);
      if (isDraft && isMonthly && viewMode === 'earned') {
        const perDaySalary = Number((row as any).per_day_salary || 0);
        const effectivePresent = Number(row.present_days || 0) + (Number(row.half_days || 0) * 0.5) + Number(row.paid_leaves || 0);
        const earnedTillDateBase = effectivePresent * perDaySalary;
        const totalCommission = Number((row as any).total_commission || 0);
        const activeBonus = Number((row as any).bonus || 0);
        const activeAdvanceDeduction = Number((row as any).advance_deduction || 0);
        
        displayNet = earnedTillDateBase + totalCommission + activeBonus - activeAdvanceDeduction;
      }
      
      return (
        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ₹{displayNet.toLocaleString()}
        </span>
      );
    }
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (row: PayrollRecord) => {
      const status = row.status;
      
      const config: Record<string, { bg: string; text: string; border: string }> = {
        paid: {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-500/30'
        },
        confirmed: {
          bg: 'bg-blue-500/10 dark:bg-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-500/30'
        },
        draft: {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-500/30'
        }
      };

      const style = config[status] || {
        bg: 'bg-slate-500/10',
        text: 'text-slate-650 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-500/30'
      };

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
          {status}
        </span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row: PayrollRecord) => {
      return (
        <div className="flex items-center gap-2 justify-end">
          {isManager && row.status === 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmMutation.mutate(row.id);
              }}
              disabled={confirmMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Confirm</span>
            </button>
          )}
          {isManager && row.status === 'confirmed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markPaidMutation.mutate({ id: row.id });
              }}
              disabled={markPaidMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Paid</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/payroll/${row.id}`);
            }}
            className="inline-flex items-center justify-center h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
            title="View Details"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      );
    }
  }
];
