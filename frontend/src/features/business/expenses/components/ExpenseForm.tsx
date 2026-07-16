import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '../schemas';
import type { ExpenseFormData, Expense } from '../schemas';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useExpenseCategories } from '../api/useExpenses';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-2">
      
      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</label>
          <InfoTooltip text="Select the exact date when this expense was incurred." />
        </div>
        <Controller
          name="expense_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              className="font-bold text-sm bg-white dark:bg-white/[0.02]"
            />
          )}
        />
        {errors.expense_date && (
          <p className="text-xs text-red-500 mt-2 ml-1 font-medium animate-in slide-in-from-top-1 fade-in-0 duration-300">
            {errors.expense_date.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</label>
          <InfoTooltip text="Select an existing category or type a new one to create it." />
        </div>
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
        <div className="flex items-center gap-1 mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount</label>
          <InfoTooltip text="Enter the exact amount paid for this expense." />
        </div>
        <Input 
          type="number" 
          step="0.01" 
          {...register('amount', { valueAsNumber: true })} 
          error={errors.amount?.message} 
          className="font-bold text-sm bg-white dark:bg-white/[0.02]"
        />
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</label>
          <InfoTooltip text="Add optional notes or descriptions to explain the spend." />
        </div>
        <Textarea 
          {...register('description')} 
          rows={3} 
          placeholder="Optional notes about the expense..." 
          className="font-medium text-sm bg-white dark:bg-white/[0.02]"
        />
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Receipt Image</label>
          <InfoTooltip text="Upload a photo or scanned copy of the payment receipt." />
        </div>
        <Input 
          id="receipt" 
          type="file" 
          accept="image/*" 
          className="bg-white dark:bg-white/[0.02] text-sm"
        />
        {initialData?.receipt_path && (
           <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">Leave empty to keep existing receipt.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel}
          className="h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-black uppercase tracking-widest shadow-md shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          {isLoading ? 'Saving...' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
};
