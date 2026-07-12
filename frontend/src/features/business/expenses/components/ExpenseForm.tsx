import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '../schemas';
import type { ExpenseFormData, Expense } from '../schemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useExpenseCategories } from '../api/useExpenses';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel
}) => {
  const { data: categories = [] } = useExpenseCategories();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category,
        amount: initialData.amount as number,
        expense_date: initialData.expense_date,
        description: initialData.description || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: ExpenseFormData) => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('amount', String(data.amount));
    formData.append('expense_date', data.expense_date);
    if (data.description) formData.append('description', data.description);
    
    // Check if receipt file was selected
    const receiptInput = document.getElementById('receipt') as HTMLInputElement;
    if (receiptInput?.files?.[0]) {
      formData.append('receipt', receiptInput.files[0]);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input type="date" {...register('expense_date')} error={errors.expense_date?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              options={categories.map((cat: any) => ({ value: cat.name, label: cat.name }))}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select or type new category"
              creatable={true}
              error={errors.category?.message}
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} error={errors.amount?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea {...register('description')} rows={3} placeholder="Optional notes about the expense" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Receipt Image</label>
        <Input id="receipt" type="file" accept="image/*" />
        {initialData?.receipt_path && (
           <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing receipt.</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>Save Expense</Button>
      </div>
    </form>
  );
};
