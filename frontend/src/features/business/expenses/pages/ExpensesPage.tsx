import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { ExpensesList } from '../components/ExpensesList';
import { ExpenseModal } from '../components/ExpenseModal';
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
    <div className="space-y-6">
      <PageHeader 
        icon={Receipt}
        title="Expenses" 
        subtitle="Manage your business expenses"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" /> Add Expense
          </Button>
        }
      />

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
