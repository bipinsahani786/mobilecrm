import React from 'react';
import { Modal } from '@/components/ui/modal';
import { DynamicForm, type FormFieldConfig } from '@/components/ui/dynamic-form';
import { leaveSchema, leaveFormConfig } from '../schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormData) => void;
  isSubmitting: boolean;
}

export const LeaveRequestFormModal: React.FC<LeaveRequestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type: '',
      from_date: '',
      to_date: '',
      reason: ''
    }
  });

  const handleSubmit = (data: LeaveFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Leave"
      description="Submit a new leave request for approval."
    >
      <DynamicForm
        id="leave-request-form"
        form={form}
        onSubmit={handleSubmit}
        sections={[{ fields: leaveFormConfig as FormFieldConfig[] }]}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
            Submit Request
          </Button>
        </div>
      </DynamicForm>
    </Modal>
  );
};
