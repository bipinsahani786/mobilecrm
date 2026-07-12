import React from 'react';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { SalaryAdvance } from '../api/useSalaryAdvances';

export const getAdvanceColumns = (): ColumnDef<SalaryAdvance>[] => {
  return [
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
          {format(new Date(row.date), 'dd MMM yyyy')}
        </span>
      )
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (row: SalaryAdvance) => <span className="text-xs font-bold text-slate-500 truncate max-w-[200px] block">{row.reason}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: SalaryAdvance) => (
        <Badge variant={
          row.status === 'deducted' ? 'success' :
            row.status === 'approved' ? 'default' :
              row.status === 'rejected' ? 'destructive' : 'warning'
        } className="capitalize">
          {row.status}
        </Badge>
      )
    }
  ];
};
