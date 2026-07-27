import React from 'react';
import { useForm } from 'react-hook-form';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { formatCurrency } from '@/lib/formatters';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ReturnCheckoutPageProps {
  cart: any[];
  cartTotal: number;
  saleId: string;
  sales: any[];
  onCancel: () => void;
  onSuccess: (data: any) => void;
  isSubmitting: boolean;
}

export function ReturnCheckoutPage({ cart, cartTotal, saleId, sales, onCancel, onSuccess, isSubmitting }: ReturnCheckoutPageProps) {
  const selectedSale = sales.find(s => String(s.id) === saleId);
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      refund_type: 'refund',
      reason: 'Defective Product',
      notes: ''
    }
  });

  const refundType = watch('refund_type');

  const handleFormSubmit = (data: any) => {
    const payload = {
      sale_id: Number(saleId),
      customer_id: selectedSale?.customer_id || null, // Allow null for walk-in
      refund_type: data.refund_type,
      refund_amount: cartTotal, // Calculate total based on items
      reason: data.reason,
      notes: data.notes,
      items: cart.map(item => ({
        sale_item_id: item.sale_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        refund_amount: item.quantity * item.unit_price
      }))
    };
    
    onSuccess(payload);
  };

  const refundTypeOptions = [
    { value: 'refund', label: 'Direct Refund (Cash/UPI)' },
  ];

  const reasonOptions = [
    { value: 'Defective Product', label: 'Defective Product' },
    { value: 'Changed Mind', label: 'Changed Mind' },
    { value: 'Wrong Item Delivered', label: 'Wrong Item Delivered' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <form className="flex-1 flex flex-col h-[calc(100vh-56px)] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden" onSubmit={handleSubmit(handleFormSubmit)}>
      
      {/* 1. Page Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#111118] flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">Return Checkout</h1>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Process refund for #{selectedSale?.invoice_number}</p>
          </div>
        </div>
      </div>

      {/* 2. Main Scrollable Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side Form Area */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Return Details Card */}
              <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm animate-in slide-in-from-bottom-2 duration-300 relative z-50">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Refund Configuration</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Select how you want to process this return</p>
                </div>
                
                <div className="p-4 sm:p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-50">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">Refund Type *</label>
                      <CustomSelect
                        value={refundType}
                        onChange={(val) => setValue('refund_type', val)}
                        options={refundTypeOptions}
                        placeholder="Select Refund Type"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">Reason *</label>
                      <CustomSelect
                        value={watch('reason')}
                        onChange={(val) => setValue('reason', val)}
                        options={reasonOptions}
                        placeholder="Select Reason"
                      />
                    </div>
                  </div>

                  {/* Removed Credit Note warning */}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">Additional Notes</label>
                    <textarea 
                      {...register('notes')} 
                      rows={3} 
                      placeholder="Enter any internal notes about this return..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0a0f] text-sm focus:ring-1 focus:ring-primary-500 shadow-inner transition-colors resize-none" 
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right side Summary Area */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-5 sticky top-4 animate-in slide-in-from-right-4 duration-300 z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4">Refund Summary</h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-3 border border-slate-200 dark:border-white/5 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {cart.map((item, idx) => (
                      <div key={item.sale_item_id} className={`py-2 ${idx !== cart.length - 1 ? 'border-b border-slate-200 dark:border-white/10' : ''}`}>
                         <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.product?.model_name}</p>
                         <div className="flex justify-between items-center mt-1">
                           <p className="text-[10px] text-slate-500">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                           <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.quantity * item.unit_price)}</p>
                         </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm pt-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Items</span>
                      <span className="font-bold">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Refund</span>
                      <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. Sticky Action Buttons Card */}
      <div className="flex items-center justify-end gap-2 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#111118] shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-none relative z-30">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 flex-1 lg:flex-none lg:px-8 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-100 cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 flex-[1.5] lg:flex-none lg:px-10 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md shadow-rose-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Processing…' : 'Process Refund'}</span>
        </button>
      </div>

    </form>
  );
}
