import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { ExpensesList } from '../components/ExpensesList';
import { ExpenseModal } from '../components/ExpenseModal';
import { ExpenseAnalytics } from '../components/ExpenseAnalytics';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../api/useExpenses';
import type { Expense } from '../schemas';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';

const ExpensesPage = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const { data: expensesData, isLoading } = useExpenses({ page });
  
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const handleOpenModal = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = (formData: FormData) => {
    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, data: formData },
        { onSuccess: handleCloseModal }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: handleCloseModal });
    }
  };

  const handleDelete = () => {
    if (deletingExpense) {
      deleteMutation.mutate(deletingExpense.id, {
        onSuccess: () => setDeletingExpense(null)
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Receipt}
        title="Expenses" 
        subtitle="Manage your business expenses"
        actions={
          <Button size="sm" onClick={() => handleOpenModal()}>
            <Plus size={14} className="mr-2" /> Add Expense
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ExpenseAnalytics />
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          <ExpensesList 
            expenses={expensesData?.data || []}
            isLoading={isLoading}
            onEdit={handleOpenModal}
            onDelete={setDeletingExpense}
            pagination={{
              currentPage: expensesData?.meta?.current_page || 1,
              totalPages: expensesData?.meta?.last_page || 1,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>

      <ExpenseModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description={`Are you sure you want to delete this expense of ${deletingExpense?.amount}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ExpensesPage;
