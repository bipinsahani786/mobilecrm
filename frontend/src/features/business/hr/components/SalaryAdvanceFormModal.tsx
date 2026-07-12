import React from 'react';
import { Modal } from '@/components/ui/modal';
import { DynamicForm, type FormFieldConfig } from '@/components/ui/dynamic-form';
import { advanceSchema, advanceFormConfig } from '../schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

type AdvanceFormInput = z.input<typeof advanceSchema>;
type AdvanceFormOutput = z.infer<typeof advanceSchema>;

interface SalaryAdvanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdvanceFormOutput) => void;
  isSubmitting: boolean;
}

export const SalaryAdvanceFormModal: React.FC<SalaryAdvanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<AdvanceFormInput, any, AdvanceFormOutput>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      amount: undefined,
      date: '',
      reason: ''
    }
  });

  const handleSubmit = (data: AdvanceFormOutput) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Salary Advance"
      description="Submit a request for an advance on your salary."
    >
      <DynamicForm
        id="salary-advance-form"
        form={form}
        onSubmit={handleSubmit}
        sections={[{ fields: advanceFormConfig as FormFieldConfig[] }]}
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
