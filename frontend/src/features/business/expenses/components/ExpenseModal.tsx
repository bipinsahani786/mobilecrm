import React from 'react';
import { Modal } from '@/components/ui/modal';
import { ExpenseForm } from './ExpenseForm';
import type { Expense } from '../schemas';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSubmit,
  isLoading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? "Edit Expense" : "Add New Expense"}
    >
      <ExpenseForm
        initialData={expense || undefined}
        onSubmit={onSubmit}
        isLoading={isLoading}
        onCancel={onClose}
      />
    </Modal>
  );
};
