import React, { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useCreateSupplierPurchase, useSupplier } from '../api/useSuppliers';
import { useInventory } from '@/features/business/inventory/api/useInventory';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Loader2, Upload, CheckCircle } from 'lucide-react';
import { purchaseSchema, type PurchaseFormValues } from '../schemas/purchaseSchema';
import { PortalTooltip } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';

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

  const { control, handleSubmit, register, formState: { errors, isSubmitting }, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const itemsStr = JSON.stringify(items);
  
  React.useEffect(() => {
    if (items && items.length > 0) {
      const total = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.purchase_price) || 0;
        return sum + (qty * price);
      }, 0);
      setValue('bill_amount', total, { shouldValidate: true, shouldDirty: true });
    }
  }, [itemsStr, setValue]);

  const onSubmit: SubmitHandler<PurchaseFormValues> = async (data) => {
    try {
      let invoicePath = undefined;
      
      if (invoiceFile) {
        const ext = invoiceFile.name.split('.').pop() || 'pdf';
        
        // 1. Get presigned URL
        const { data: presignedResponse } = await api.post('/upload/presigned-url', {
          extension: ext,
          folder: 'invoices/business'
        });
        
        const presignedData = presignedResponse.data;
        
        // 2. Upload file directly to S3/R2
        await fetch(presignedData.upload_url, {
          method: 'PUT',
          body: invoiceFile,
          headers: {
            'Content-Type': invoiceFile.type,
          },
        });
        
        invoicePath = presignedData.path;
      }
      
      // 3. Submit data to backend
      const payload = {
        bill_amount: data.bill_amount,
        paid_amount: data.paid_amount || 0,
        purchase_date: data.purchase_date,
        due_date: data.due_date,
        invoice_file: invoicePath,
        items: data.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          purchase_price: Number(item.purchase_price),
          mrp: item.mrp ? Number(item.mrp) : undefined
        }))
      };

      await createPurchase.mutateAsync({ supplierId, payload });
      toast.success('Purchase bill added successfully');
      navigate(`/suppliers/${supplierId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add purchase bill');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pb-20 text-slate-900 dark:text-slate-200">
      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
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
              <span className="text-primary-500">Add Purchase</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
              Add Purchase Bill
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">For {supplier?.name || 'Loading...'}</p>
          </div>
          
        </div>
        <form id="purchase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          

          {/* Top Section: Items */}

                      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest">Items Received</h3>
                <Button size="sm" variant="brand" type="button" onClick={() => append({ product_id: '', quantity: 1, purchase_price: 0 })} className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                  <Plus className="w-3.5 h-3.5 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-1">
                      <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">Product *</label>
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
                    
                    <div className="w-32 space-y-1">
                      <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">Batch No</label>
                      <Input 
                        type="text" 
                        {...register(`items.${index}.batch_number`)}
                        placeholder="Optional"
                      />
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
                        {...register(`items.${index}.purchase_price`)}
                        min="0"
                      />
                      {errors.items?.[index]?.purchase_price && <span className="text-red-500 text-xs">{errors.items[index].purchase_price.message}</span>}
                    </div>

                    <div className="w-24 space-y-1">
                      <label className="block text-xs font-medium text-slate-500 whitespace-nowrap">MRP</label>
                      <Input 
                        type="number" 
                        {...register(`items.${index}.mrp`)}
                        min="0"
                        placeholder="Auto"
                      />
                      {errors.items?.[index]?.mrp && <span className="text-red-500 text-xs">{errors.items[index].mrp?.message}</span>}
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

          {/* Bottom Section: Financials & Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-5 border-b border-slate-100 dark:border-white/5 pb-3">Purchase Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bill Amount *
                  </label>
                  <Input 
                    type="number"
                    {...register('bill_amount')}
                    placeholder="Total amount"
                    step="0.01"
                    className="h-11 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]"
                  />
                  {errors.bill_amount && <span className="text-red-500 text-xs">{errors.bill_amount.message}</span>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Paid Amount
                  </label>
                  <Input 
                    type="number"
                    {...register('paid_amount')}
                    placeholder="Amount paid now"
                    step="0.01"
                    className="h-11 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]"
                  />
                  {errors.paid_amount && <span className="text-red-500 text-xs">{errors.paid_amount.message}</span>}
                </div>
                
                 <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Purchase Date *
                  </label>
                  <Controller
                    name="purchase_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.purchase_date && <span className="text-red-500 text-xs">{errors.purchase_date.message}</span>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Due Date
                  </label>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.due_date && <span className="text-red-500 text-xs">{errors.due_date.message}</span>}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-5 border-b border-slate-100 dark:border-white/5 pb-3">Invoice Document</h3>
              <div className="space-y-2 flex-1 flex flex-col">
                <div className="relative border-2 flex-1 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px] group overflow-hidden">
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
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" type="button" onClick={() => navigate(`/suppliers/${supplierId}`)} disabled={isSubmitting} className="h-11 px-6 text-sm rounded-xl font-bold uppercase tracking-widest bg-white dark:bg-[#09090b] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm">
              Cancel
            </Button>
            <Button type="submit" form="purchase-form" disabled={isSubmitting} className="h-11 px-8 text-sm rounded-xl font-bold uppercase tracking-widest bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/30">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Purchase
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
