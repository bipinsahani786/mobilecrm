import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, Tags } from 'lucide-react';
import { useCreateBrand, useUpdateBrand } from '../api/useBrands';
import type { Brand, BrandFormValues } from '../schemas/brandSchema';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { brandFormConfig } from '../constants/brandForm';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
});

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandToEdit?: Brand | null;
}

export function BrandFormModal({ isOpen, onClose, brandToEdit }: BrandFormModalProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '' }
  });

  const { reset, formState: { isSubmitting } } = form;

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();

  useEffect(() => {
    if (brandToEdit) {
      reset({ name: brandToEdit.name });
    } else {
      reset({ name: '' });
    }
  }, [brandToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<BrandFormValues> = async (data) => {
    try {
      if (brandToEdit) {
        await updateMutation.mutateAsync({ id: brandToEdit.id, data });
        toast.success('Brand updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Brand created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center">
            <Tags className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          {brandToEdit ? 'Edit Brand' : 'Create New Brand'}
        </div>
      }
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="brand-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {brandToEdit ? 'Save Changes' : 'Create Brand'}
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="brand-form"
        form={form}
        onSubmit={onSubmit}
        sections={brandFormConfig}
      />
    </Modal>
  );
}
