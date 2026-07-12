import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { Expense } from '../schemas';
import { Button } from '@/components/ui/button';
import { Edit, Trash, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface ExpensesListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  pagination
}) => {
  const columns = useMemo(() => [
    {
      header: 'Date',
      accessorKey: 'expense_date' as keyof Expense,
      cell: (row: Expense) => (
        <span className="text-[10px] font-bold text-slate-500 mt-0.5">{formatDate(row.expense_date)}</span>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category' as keyof Expense,
      cell: (row: Expense) => (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {row.category}
        </span>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'amount' as keyof Expense,
      cell: (row: Expense) => (
        <span className="text-sm font-black text-rose-600 dark:text-rose-400">
          {formatCurrency(Number(row.amount))}
        </span>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description' as keyof Expense,
      cell: (row: Expense) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px] inline-block">
          {row.description || '-'}
        </span>
      )
    },
    {
      header: 'Added By',
      accessorKey: 'added_by_name' as keyof Expense,
      cell: (row: Expense) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {row.added_by_name || 'Unknown'}
        </span>
      )
    },
    {
      header: 'Receipt',
      accessorKey: 'receipt_path' as keyof Expense,
      cell: (row: Expense) => row.receipt_path ? (
        <a href={row.receipt_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors text-[10px] font-bold uppercase tracking-widest">
          <FileText className="w-3 h-3" /> View
        </a>
      ) : (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">-</span>
      )
    },
    {
      header: '',
      accessorKey: 'id' as keyof Expense,
      className: 'text-right',
      cell: (row: Expense) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(row)} 
            title="Edit"
            className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 rounded-lg p-0 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(row)} 
            title="Delete"
            className="w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-lg p-0 transition-colors"
          >
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={expenses}
      isLoading={isLoading}
      pagination={pagination}
      emptyMessage="No expenses found"
    />
  );
};
