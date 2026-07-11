import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2 } from 'lucide-react';
import { useUpdateSupplier } from '../api/useSuppliers';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { supplierFormConfig } from '../constants/supplierForm';
import { supplierSchema, type SupplierFormValues } from '../schemas/supplierSchema';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: any;
}

export function EditSupplierModal({ isOpen, onClose, supplier }: EditSupplierModalProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      items_supplied: supplier?.items_supplied || '',
    },
  });

  const { reset, formState: { isSubmitting } } = form;
  const updateSupplier = useUpdateSupplier();

  // Reset form when modal opens or supplier changes
  React.useEffect(() => {
    if (isOpen && supplier) {
      reset({
        name: supplier.name || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        items_supplied: supplier.items_supplied || '',
      });
    }
  }, [isOpen, supplier, reset]);

  const onSubmit: SubmitHandler<SupplierFormValues> = async (data) => {
    try {
      await updateSupplier.mutateAsync({
        id: supplier.id,
        data,
      });
      toast.success('Supplier updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update supplier');
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
            <Edit2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          Edit Supplier
        </div>
      }
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="edit-supplier-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="edit-supplier-form"
        form={form}
        onSubmit={onSubmit}
        sections={supplierFormConfig}
      />
    </Modal>
  );
}
