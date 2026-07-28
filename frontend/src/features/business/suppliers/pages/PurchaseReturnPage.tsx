import React, { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useCreatePurchaseReturn, useSupplier } from '../api/useSuppliers';
import { useInventory } from '@/features/business/inventory/api/useInventory';
import { toast } from 'sonner';
import { Plus, Trash2, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { PortalTooltip } from '@/components/layout/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import { purchaseReturnSchema, type PurchaseReturnFormValues } from '../schemas/purchaseReturnSchema';


export default function PurchaseReturnPage() {
  const { id } = useParams();
  const supplierId = Number(id);
  const navigate = useNavigate();
  const { data: supplier } = useSupplier(supplierId);

  const { data: inventoryResponse } = useInventory({ per_page: 1000, supplier_id: Number(supplierId) });
  const products = inventoryResponse?.data || [];

  const createReturn = useCreatePurchaseReturn();

  const form = useForm<PurchaseReturnFormValues>({
    resolver: zodResolver(purchaseReturnSchema) as any,
    defaultValues: {
      return_date: new Date().toISOString().split('T')[0],
      supplier_purchase_id: '',
      reason: '',
      notes: '',
      items: [{ product_id: '', product_batch_id: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { control, handleSubmit, register, formState: { errors, isSubmitting }, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const itemsStr = JSON.stringify(items);

  // Auto-calculate total
  const totalAmount = React.useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
  }, [itemsStr]);

  // Build purchase options for dropdown
  const purchaseOptions = React.useMemo(() => {
    if (!supplier?.purchases) return [];
    return supplier.purchases.map((p: any) => ({
      value: p.id.toString(),
      label: `${p.purchase_number || `#${p.id}`} — ${formatCurrency(p.bill_amount)} (${new Date(p.purchase_date).toLocaleDateString()})`,
    }));
  }, [supplier?.purchases]);

  // Build product options
  const productOptions = React.useMemo(() => {
    return products.map((p: any) => ({
      value: p.id.toString(),
      label: `${p.model_name}${p.quantity !== undefined ? ` (Stock: ${p.quantity})` : ''}`,
    }));
  }, [products]);

  // Auto-fill purchase price when product selected
  const handleProductChange = (index: number, productId: string | number) => {
    const idString = productId.toString();
    setValue(`items.${index}.product_id`, idString as any);
    const product = products.find((p: any) => p.id.toString() === idString);
    if (product) {
      setValue(`items.${index}.unit_price`, product.purchase_price || 0);
    }
  };

  const onSubmit: SubmitHandler<PurchaseReturnFormValues> = async (data) => {
    try {
      const payload = {
        return_date: data.return_date,
        supplier_purchase_id: data.supplier_purchase_id ? Number(data.supplier_purchase_id) : undefined,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
        items: data.items.map(item => ({
          product_id: Number(item.product_id),
          product_batch_id: item.product_batch_id ? Number(item.product_batch_id) : undefined,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      await createReturn.mutateAsync({ supplierId, data: payload });
      toast.success('Purchase return recorded successfully! Stock updated.');
      navigate(`/suppliers/${supplierId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to record purchase return');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pb-20 text-slate-900 dark:text-slate-200">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-rose-500/10 dark:bg-rose-500/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-amber-500/10 dark:bg-amber-500/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 z-10">
        
        {/* Top Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              <button onClick={() => navigate('/suppliers')} className="hover:text-primary-500 transition-colors">Suppliers</button>
              <span>/</span>
              <button onClick={() => navigate(`/suppliers/${supplierId}`)} className="hover:text-primary-500 transition-colors">{supplier?.name || 'Loading'}</button>
              <span>/</span>
              <span className="text-rose-500">Purchase Return</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-rose-500" />
              </div>
              Purchase Return
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Return items to {supplier?.name || 'Loading...'}</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Items returned will be <span className="font-black">deducted from your inventory</span> and the <span className="font-black">supplier's bill will be adjusted</span> automatically.
          </p>
        </div>

        <form id="return-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Return Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-5 border-b border-slate-100 dark:border-white/5 pb-3">Return Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Return Date *
                  </label>
                  <Controller
                    name="return_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.return_date && <span className="text-red-500 text-xs">{errors.return_date.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Against Purchase Bill (Optional)
                  </label>
                  <Controller
                    control={control}
                    name="supplier_purchase_id"
                    render={({ field }) => (
                      <SearchableSelect
                        options={purchaseOptions}
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select purchase bill (optional)..."
                      />
                    )}
                  />
                  <p className="text-[10px] text-slate-400">Link to a specific purchase to auto-adjust that bill's amount</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-5 border-b border-slate-100 dark:border-white/5 pb-3">Reason & Notes</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Reason for Return
                  </label>
                  <Input
                    {...register('reason')}
                    placeholder="e.g., Defective, Unsold, Wrong item"
                    className="h-11 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    placeholder="Additional notes..."
                    rows={3}
                    className="flex w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest">Items to Return</h3>
              <Button size="sm" variant="brand" type="button" onClick={() => append({ product_id: '', product_batch_id: '', quantity: 1, unit_price: 0 })} className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                <Plus className="w-3.5 h-3.5 mr-2" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5">
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">Product *</label>
                    <Controller
                      control={control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <SearchableSelect
                          options={productOptions}
                          value={field.value}
                          onChange={(val: string | number) => handleProductChange(index, val)}
                          placeholder="Select Product..."
                        />
                      )}
                    />
                    {errors.items?.[index]?.product_id && <span className="text-red-500 text-xs">{errors.items[index].product_id.message}</span>}
                  </div>
                  
                  <div className="w-24 space-y-1">
                    <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">Qty *</label>
                    <Input 
                      type="number" 
                      {...register(`items.${index}.quantity`)}
                      min="1"
                    />
                    {errors.items?.[index]?.quantity && <span className="text-red-500 text-xs">{errors.items[index].quantity.message}</span>}
                  </div>
                  
                  <div className="w-36 space-y-1">
                    <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">Price/Unit *</label>
                    <Input 
                      type="number" 
                      {...register(`items.${index}.unit_price`)}
                      min="0"
                      step="0.01"
                    />
                    {errors.items?.[index]?.unit_price && <span className="text-red-500 text-xs">{errors.items[index].unit_price.message}</span>}
                  </div>

                  <div className="w-32 space-y-1">
                    <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">Total</label>
                    <div className="h-10 flex items-center px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      {formatCurrency((Number(items?.[index]?.quantity) || 0) * (Number(items?.[index]?.unit_price) || 0))}
                    </div>
                  </div>

                  <div className="pt-5">
                    <PortalTooltip text="Remove Item" visible={true}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" 
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </PortalTooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Return Amount</div>
              <div className="text-3xl font-display font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {formatCurrency(totalAmount)}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => navigate(`/suppliers/${supplierId}`)} disabled={isSubmitting} className="h-11 px-6 text-sm rounded-xl font-bold uppercase tracking-widest bg-white dark:bg-[#09090b] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm">
                Cancel
              </Button>
              <Button type="submit" form="return-form" disabled={isSubmitting} className="h-11 px-8 text-sm rounded-xl font-bold uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/30">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Return
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
