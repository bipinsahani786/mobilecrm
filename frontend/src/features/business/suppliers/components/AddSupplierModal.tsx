import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { useCreateSupplier } from '../api/useSuppliers';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { supplierFormConfig } from '../constants/supplierForm';
import { supplierSchema, type SupplierFormValues } from '../schemas/supplierSchema';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSupplierModal({ isOpen, onClose }: AddSupplierModalProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      items_supplied: '',
    },
  });

  const { reset, formState: { isSubmitting } } = form;
  const createSupplier = useCreateSupplier();

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        phone: '',
        address: '',
        items_supplied: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<SupplierFormValues> = async (data) => {
    try {
      await createSupplier.mutateAsync(data);
      toast.success('Supplier added successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add supplier');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          Add New Supplier
        </div>
      }
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="supplier-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Supplier
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="supplier-form"
        form={form}
        onSubmit={onSubmit}
        sections={supplierFormConfig}
      />
    </Modal>
  );
}
