import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDirectAdd } from '../api/useDirectAdd';
import type { Product } from '../schemas/productSchema';
import { PackagePlus } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const directAddSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  purchase_price: z.number().min(0, 'Purchase price cannot be negative').optional(),
  mrp: z.number().min(0, 'MRP cannot be negative').optional(),
  batch_number: z.string().optional(),
});

type DirectAddValues = z.infer<typeof directAddSchema>;

interface DirectAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function DirectAddModal({ isOpen, onClose, product }: DirectAddModalProps) {
  const mutation = useDirectAdd();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DirectAddValues>({
    resolver: zodResolver(directAddSchema),
    defaultValues: {
      quantity: 1,
      batch_number: '',
    }
  });

  useEffect(() => {
    if (isOpen && product) {
      reset({
        quantity: 1,
        purchase_price: product.purchase_price,
        mrp: product.mrp,
        batch_number: '',
      });
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (data: DirectAddValues) => {
    if (!product) return;
    try {
      await mutation.mutateAsync({
        product_id: product.id,
        quantity: data.quantity,
        purchase_price: data.purchase_price,
        mrp: data.mrp,
        batch_number: data.batch_number,
      });
      toast.success('Stock added successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add stock');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Direct Add Stock" maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {product && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add stock for {product.model_name}
          </p>
        )}
        
        <div>
          <div className="flex items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Quantity to Add
            </label>
            <InfoTooltip text="Number of product units to add to the inventory." />
          </div>
          <div className="relative">
            <PackagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className={`pl-9 ${errors.quantity ? 'border-rose-500' : ''}`}
            />
          </div>
          {errors.quantity && <p className="mt-1 text-sm text-rose-500">{errors.quantity.message}</p>}
        </div>

        <div>
          <div className="flex items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Batch Number / Identifier (Optional)
            </label>
            <InfoTooltip text="Optional unique identifier or batch number tracker (e.g. BATCH-001)." />
          </div>
          <Input
            type="text"
            placeholder="e.g. BATCH-001, IMEI list, etc."
            {...register('batch_number')}
            className={`${errors.batch_number ? 'border-rose-500' : ''}`}
          />
          {errors.batch_number && <p className="mt-1 text-sm text-rose-500">{errors.batch_number.message}</p>}
        </div>

        <div>
          <div className="flex items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Update Purchase Price (Optional)
            </label>
            <InfoTooltip text="Specify a new purchase cost price if the cost for this batch has changed." />
          </div>
          <Input
            type="number"
            {...register('purchase_price', { valueAsNumber: true })}
            className={`${errors.purchase_price ? 'border-rose-500' : ''}`}
          />
          <p className="mt-1 text-xs text-slate-500">Leave unchanged if the price hasn't changed.</p>
          {errors.purchase_price && <p className="mt-1 text-sm text-rose-500">{errors.purchase_price.message}</p>}
        </div>

        <div>
          <div className="flex items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Update MRP (Optional)
            </label>
            <InfoTooltip text="Specify a new Maximum Retail Price (selling price) if the MRP has changed." />
          </div>
          <Input
            type="number"
            {...register('mrp', { valueAsNumber: true })}
            className={`${errors.mrp ? 'border-rose-500' : ''}`}
          />
          <p className="mt-1 text-xs text-slate-500">Leave unchanged if the MRP hasn't changed.</p>
          {errors.mrp && <p className="mt-1 text-sm text-rose-500">{errors.mrp.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={mutation.isPending}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {mutation.isPending ? 'Adding...' : 'Add Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
