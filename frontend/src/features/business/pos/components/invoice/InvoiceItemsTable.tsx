import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceItemsTableProps {
  items: any[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <div className="p-8">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-800">
            <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Item Description</th>
            <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300 text-center">Qty</th>
            <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Price</th>
            <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {items?.map((item: any) => (
            <tr key={item.id}>
              <td className="py-4">
                <p className="font-medium text-slate-900 dark:text-white">{item.product?.model_name || 'Unknown Product'}</p>
                {item.batch && <p className="text-xs text-slate-500 mt-1">Batch: {item.batch.batch_number}</p>}
              </td>
              <td className="py-4 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
              <td className="py-4 text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.unit_price)}</td>
              <td className="py-4 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
