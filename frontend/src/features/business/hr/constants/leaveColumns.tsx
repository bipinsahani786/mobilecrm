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
      cell: (row: LeaveRequest) => <span className="text-sm text-slate-500 truncate max-w-[200px] block">{row.reason}</span>
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
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: row.id, status: 'approved' }); }}
              isLoading={updateStatusMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: row.id, status: 'rejected' }); }}
              isLoading={updateStatusMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
          </div>
        );
      }
    }] : [])
  ];
};
