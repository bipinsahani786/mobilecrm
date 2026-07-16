import React from 'react';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import type { LeaveRequest } from '../api/useLeaveRequests';

interface GetLeaveColumnsProps {
  isManager: boolean | undefined;
  updateStatusMutation: any;
}

export const getLeaveColumns = ({
  isManager,
  updateStatusMutation,
}: GetLeaveColumnsProps): ColumnDef<LeaveRequest>[] => {
  return [
    {
      header: 'Staff Member',
      accessorKey: 'user',
      cell: (row: LeaveRequest) => row.user?.name || '-'
    },
    {
      header: 'Leave Type',
      accessorKey: 'leave_type',
      cell: (row: LeaveRequest) => <span className="capitalize">{row.leave_type}</span>
    },
    {
      header: 'Duration',
      cell: (row: LeaveRequest) => (
        <span className="text-sm">
          {format(new Date(row.from_date), 'dd MMM yyyy')} - {format(new Date(row.to_date), 'dd MMM yyyy')}
        </span>
      )
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (row: LeaveRequest) => <span className="text-xs font-bold text-slate-500 truncate max-w-[200px] block">{row.reason}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: LeaveRequest) => (
        <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">
          {row.status}
        </Badge>
      )
    },
    ...(isManager ? [{
      header: 'Actions',
      cell: (row: LeaveRequest) => {
        if (row.status !== 'pending') return null;
        return (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: row.id, status: 'approved' }); }}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: row.id, status: 'rejected' }); }}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        );
      }
    }] : [])
  ];
};
