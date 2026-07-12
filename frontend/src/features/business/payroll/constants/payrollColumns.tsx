import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import React from 'react';
import type { PayrollRecord } from '../api/usePayroll';

interface PayrollColumnActions {
  confirmMutation: any;
  markPaidMutation: any;
  navigate: any;
}

export const getPayrollColumns = ({ confirmMutation, markPaidMutation, navigate }: PayrollColumnActions): any[] => [
  {
    header: 'Staff Member',
    accessorKey: 'user.name',
    cell: (row: PayrollRecord) => (
      <div className="font-bold text-xs text-slate-900 dark:text-white">
        {row.user?.name}
      </div>
    )
  },
  {
    header: 'Base Salary',
    accessorKey: 'base_salary',
    cell: (row: PayrollRecord) => `₹${Number(row.base_salary).toLocaleString()}`
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
      const val = Number(row.deduction) + Number(row.advance_deduction);
      return val > 0 ? <span className="text-red-500">-₹{val.toLocaleString()}</span> : '-';
    }
  },
  {
    header: 'Final Salary',
    accessorKey: 'final_salary',
    cell: (row: PayrollRecord) => (
      <span className="font-bold text-slate-900 dark:text-white">
        ₹{Number(row.final_salary).toLocaleString()}
      </span>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (row: PayrollRecord) => {
      const status = row.status;
      return (
        <Badge 
          variant={status === 'paid' ? 'success' : status === 'confirmed' ? 'default' : 'outline'}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row: PayrollRecord) => {
      return (
        <div className="flex items-center gap-2 justify-end">
          {row.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                confirmMutation.mutate(row.id);
              }}
              isLoading={confirmMutation.isPending}
            >
              Confirm
            </Button>
          )}
          {row.status === 'confirmed' && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markPaidMutation.mutate({ id: row.id });
              }}
              isLoading={markPaidMutation.isPending}
            >
              Mark Paid
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/payroll/${row.id}`);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];
