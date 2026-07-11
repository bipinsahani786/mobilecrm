import React, { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useCreateSupplierPurchase, useSupplier } from '../api/useSuppliers';
import { useInventory } from '@/features/business/inventory/api/useInventory';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Loader2, Upload, CheckCircle } from 'lucide-react';
import { purchaseSchema, type PurchaseFormValues } from '../schemas/purchaseSchema';
import { PortalTooltip } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddPurchasePage() {
  const { id } = useParams();
  const supplierId = Number(id);
  const navigate = useNavigate();
  const { data: supplier } = useSupplier(supplierId);

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const { data: inventoryResponse } = useInventory({ per_page: 1000 });
  const products = inventoryResponse?.data || [];

  const createPurchase = useCreateSupplierPurchase();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      bill_amount: 0,
      paid_amount: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      due_date: '',
      items: [{ product_id: '', quantity: 1, purchase_price: 0 }],
    },
  });

  const { control, handleSubmit, register, formState: { errors, isSubmitting } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit: SubmitHandler<PurchaseFormValues> = async (data) => {
    const formData = new FormData();
    formData.append('bill_amount', data.bill_amount.toString());
    formData.append('paid_amount', (data.paid_amount || 0).toString());
    formData.append('purchase_date', data.purchase_date);
    if (data.due_date) formData.append('due_date', data.due_date);
    if (invoiceFile) formData.append('invoice_file', invoiceFile);

    data.items.forEach((item, index) => {
      formData.append(`items[${index}][product_id]`, item.product_id);
      formData.append(`items[${index}][quantity]`, item.quantity.toString());
      formData.append(`items[${index}][purchase_price]`, item.purchase_price.toString());
      if (item.mrp !== undefined) formData.append(`items[${index}][mrp]`, item.mrp.toString());
      if (item.batch_number) formData.append(`items[${index}][batch_number]`, item.batch_number);
    });

    try {
      await createPurchase.mutateAsync({ supplierId, formData });
      toast.success('Purchase bill added successfully');
      navigate(`/suppliers/${supplierId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add purchase bill');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pb-20 text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={FileText}
        title="Add Purchase Bill"
        subtitle={supplier ? `For ${supplier.name}` : 'Loading...'}
        breadcrumbs={[
          { label: 'Suppliers', onClick: () => navigate('/suppliers') },
          { label: supplier?.name || 'Loading', onClick: () => navigate(`/suppliers/${supplierId}`) },
          { label: 'Add Purchase', active: true }
        ]}
      />

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <form id="purchase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Bill Amount *
                </label>
                <Input 
                  type="number"
                  {...register('bill_amount')}
                  placeholder="Total amount"
                  step="0.01"
                />
                {errors.bill_amount && <span className="text-red-500 text-xs">{errors.bill_amount.message}</span>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Paid Amount
                </label>
                <Input 
                  type="number"
                  {...register('paid_amount')}
                  placeholder="Amount paid now"
                  step="0.01"
                />
                {errors.paid_amount && <span className="text-red-500 text-xs">{errors.paid_amount.message}</span>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Purchase Date *
                </label>
                <Input 
                  type="date"
                  {...register('purchase_date')}
                />
                {errors.purchase_date && <span className="text-red-500 text-xs">{errors.purchase_date.message}</span>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Due Date
                </label>
                <Input 
                  type="date"
                  {...register('due_date')}
                />
                {errors.due_date && <span className="text-red-500 text-xs">{errors.due_date.message}</span>}
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Invoice Document (PDF/Image)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px] group overflow-hidden">
                  <input 
                    type="file"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {invoiceFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-sm">
                        {invoiceFile.type.includes('image') ? (
                          <img src={URL.createObjectURL(invoiceFile)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Uploaded Successfully</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[250px] mt-0.5">{invoiceFile.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary-100 dark:border-primary-500/20">
                        <Upload className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload or drag and drop</span>
                        <span className="text-xs font-medium text-slate-500 mt-0.5">PDF, JPG, PNG (Max 10MB)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Items Received</h3>
                <Button size="sm" variant="outline" type="button" onClick={() => append({ product_id: '', quantity: 1, purchase_price: 0 })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-1">
                      <label className="block text-xs font-medium text-slate-500">Product *</label>
                      <Controller
                        control={control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <SearchableSelect
                            options={products.map(p => ({ value: p.id.toString(), label: p.model_name }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select Product..."
                          />
                        )}
                      />
                      {errors.items?.[index]?.product_id && <span className="text-red-500 text-xs">{errors.items[index].product_id.message}</span>}
                    </div>
                    
                    <div className="w-24 space-y-1">
                      <label className="block text-xs font-medium text-slate-500">Qty *</label>
                      <Input 
                        type="number" 
                        {...register(`items.${index}.quantity`)}
                        min="1"
                      />
                      {errors.items?.[index]?.quantity && <span className="text-red-500 text-xs">{errors.items[index].quantity.message}</span>}
                    </div>
                    
                    <div className="w-32 space-y-1">
                      <label className="block text-xs font-medium text-slate-500">Purchase Price/Unit *</label>
                      <Input 
                        type="number" 
                        {...register(`items.${index}.purchase_price`)}
                        min="0"
                      />
                      {errors.items?.[index]?.purchase_price && <span className="text-red-500 text-xs">{errors.items[index].purchase_price.message}</span>}
                    </div>

                    <div className="w-24 space-y-1">
                      <label className="block text-xs font-medium text-slate-500">MRP</label>
                      <Input 
                        type="number" 
                        {...register(`items.${index}.mrp`)}
                        min="0"
                        placeholder="Auto"
                      />
                      {errors.items?.[index]?.mrp && <span className="text-red-500 text-xs">{errors.items[index].mrp?.message}</span>}
                    </div>

                    <div className="w-32 space-y-1">
                      <label className="block text-xs font-medium text-slate-500">Batch No</label>
                      <Input 
                        type="text" 
                        {...register(`items.${index}.batch_number`)}
                        placeholder="Optional"
                      />
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

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
              <Button variant="outline" type="button" onClick={() => navigate(`/suppliers/${supplierId}`)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" form="purchase-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Purchase
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
