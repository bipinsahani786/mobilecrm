import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '../schemas/categorySchema';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, Tags } from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '../api/useCategories';
import type { Category, CategoryFormValues } from '../schemas/categorySchema';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { getCategoryFormConfig } from '../constants/categoryForm';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export function CategoryFormModal({ isOpen, onClose, categoryToEdit }: CategoryFormModalProps) {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    }
  });

  const { reset, formState: { isSubmitting } } = form;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
      });
    } else {
      reset({
        name: '',
      });
    }
  }, [categoryToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    try {
      if (categoryToEdit) {
        await updateMutation.mutateAsync({ id: categoryToEdit.id, data });
        toast.success('Category updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Category created successfully');
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
          {categoryToEdit ? 'Edit Category' : 'Create New Category'}
        </div>
      }
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="category-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="category-form"
        form={form}
        onSubmit={onSubmit}
        sections={getCategoryFormConfig()}
      />
    </Modal>
  );
}
