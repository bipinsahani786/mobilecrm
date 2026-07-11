import React from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

interface OrderSummaryProps {
  cartTotal: number;
  finalAmount: number;
  register: any; // from react-form-hooks
}

export function OrderSummary({ cartTotal, finalAmount, register }: OrderSummaryProps) {
  return (
    <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50/80 dark:bg-white/[0.02] px-4 py-3 border-b border-slate-200 dark:border-white/10">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Order Summary</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Subtotal</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(cartTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Discount (-)</span>
          <div className="w-24 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">₹</span>
            <Input type="number" {...register('discount')} min="0" step="0.01" className="h-8 pl-6 pr-2 text-right font-semibold text-xs border-slate-200 shadow-none focus-visible:ring-1 focus-visible:border-primary-400 bg-slate-50" placeholder="0.00" />
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Round Off (+/-)</span>
          <div className="w-24 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">₹</span>
            <Input type="number" {...register('round_off')} step="0.01" className="h-8 pl-6 pr-2 text-right font-semibold text-xs border-slate-200 shadow-none focus-visible:ring-1 focus-visible:border-primary-400 bg-slate-50" placeholder="0.00" />
          </div>
        </div>
      </div>
      <div className="bg-primary-50/50 dark:bg-primary-900/10 px-4 py-3 border-t border-primary-100 dark:border-primary-900/30 flex justify-between items-center">
        <span className="font-bold text-slate-900 dark:text-white">Final Amount</span>
        <span className="text-2xl font-display font-black text-primary-600 dark:text-primary-400 tracking-tight">
          {formatCurrency(finalAmount)}
        </span>
      </div>
    </div>
  );
}
