import React from 'react';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { SalaryAdvance } from '../api/useSalaryAdvances';
import { Check, X } from 'lucide-react';

export const getAdvanceColumns = ({ isManager, updateStatusMutation }: { isManager?: boolean, updateStatusMutation?: any } = {}): ColumnDef<SalaryAdvance>[] => {
  const columns: ColumnDef<SalaryAdvance>[] = [
    {
      header: 'Staff Member',
      accessorKey: 'user', // fixed from user.name
      cell: (row: SalaryAdvance) => row.user?.name || '-'
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: SalaryAdvance) => <span className="font-bold text-xs">₹{Number(row.amount).toLocaleString()}</span>
    },
    {
      header: 'Date Requested',
      cell: (row: SalaryAdvance) => (
        <span className="text-sm">
          {row.given_date ? format(new Date(row.given_date), 'dd MMM yyyy') : '-'}
        </span>
      )
    },
    {
      header: 'Reason',
      accessorKey: 'notes',
      cell: (row: SalaryAdvance) => <span className="text-xs font-bold text-slate-500 truncate max-w-[200px] block">{row.notes || '-'}</span>
    },
    {
      header: 'Status',
      cell: (row: SalaryAdvance) => {
        let variant: any = 'warning';
        let label = 'Pending';
        if (row.is_deducted) {
          variant = 'success';
          label = 'Deducted';
        } else if (row.status === 'approved') {
          variant = 'success';
          label = 'Approved (Pending Deduction)';
        } else if (row.status === 'rejected') {
          variant = 'destructive';
          label = 'Rejected';
        }

        return (
          <Badge variant={variant} className="capitalize">
            {label}
          </Badge>
        );
      }
    }
  ];

  if (isManager) {
    columns.push({
      header: 'Actions',
      cell: (row: SalaryAdvance) => {
        if (row.status !== 'pending' || row.is_deducted) {
          return <span className="text-xs text-slate-400">Processed</span>;
        }

        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); updateStatusMutation?.mutate({ id: row.id, status: 'approved' }); }}
              disabled={updateStatusMutation?.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              title="Approve"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); updateStatusMutation?.mutate({ id: row.id, status: 'rejected' }); }}
              disabled={updateStatusMutation?.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              title="Reject"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        );
      }
    });
  }

  return columns;
};
