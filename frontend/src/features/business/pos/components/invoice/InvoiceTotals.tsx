import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceTotalsProps {
  sale: any;
}

export function InvoiceTotals({ sale }: InvoiceTotalsProps) {
  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/5 flex justify-end">
      <div className="w-full max-w-sm space-y-3">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Subtotal</span>
          <span>{formatCurrency(sale.total_amount)}</span>
        </div>
        
        {Number(sale.discount) > 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Discount</span>
            <span>- {formatCurrency(sale.discount)}</span>
          </div>
        )}
        
        {Number(sale.round_off) !== 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Round Off</span>
            <span>{formatCurrency(sale.round_off)}</span>
          </div>
        )}
        
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-lg font-bold">
          <span className="text-slate-900 dark:text-white">Final Amount</span>
          <span className="text-primary-600 dark:text-primary-400 font-display text-2xl">{formatCurrency(sale.final_amount)}</span>
        </div>
      </div>
    </div>
  );
}
