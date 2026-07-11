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
      cell: (row: Expense) => formatDate(row.expense_date)
    },
    {
      header: 'Category',
      accessorKey: 'category' as keyof Expense,
    },
    {
      header: 'Amount',
      accessorKey: 'amount' as keyof Expense,
      cell: (row: Expense) => formatCurrency(Number(row.amount))
    },
    {
      header: 'Description',
      accessorKey: 'description' as keyof Expense,
      cell: (row: Expense) => row.description || '-'
    },
    {
      header: 'Added By',
      accessorKey: 'added_by_name' as keyof Expense,
      cell: (row: Expense) => row.added_by_name || 'Unknown'
    },
    {
      header: 'Receipt',
      accessorKey: 'receipt_path' as keyof Expense,
      cell: (row: Expense) => row.receipt_path ? (
        <a href={row.receipt_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
          <FileText size={16} /> View
        </a>
      ) : '-'
    },
    {
      header: 'Actions',
      accessorKey: 'id' as keyof Expense,
      cell: (row: Expense) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)} title="Edit">
            <Edit size={16} className="text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row)} title="Delete">
            <Trash size={16} className="text-red-600" />
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
