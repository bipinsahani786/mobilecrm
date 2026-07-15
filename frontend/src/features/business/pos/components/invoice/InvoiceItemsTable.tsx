import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceItemsTableProps {
  items: any[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <div className="px-6 py-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-800">
            <th className="pb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Item Description</th>
            <th className="pb-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">Qty</th>
            <th className="pb-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">Price</th>
            <th className="pb-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {items?.map((item: any) => (
            <tr key={item.id}>
              <td className="py-2">
                <p className="font-medium text-xs text-slate-900 dark:text-white">{item.product?.model_name || 'Unknown Product'}</p>
                {item.batch && <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Batch: {item.batch.batch_number}</p>}
                {item.imei_1 && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                    IMEI 1: {item.imei_1} {item.imei_2 ? `| IMEI 2: ${item.imei_2}` : ''}
                  </p>
                )}
                {item.serial_no && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                    Serial No: {item.serial_no}
                  </p>
                )}
              </td>
              <td className="py-2 text-center text-xs text-slate-600 dark:text-slate-400">{item.quantity}</td>
              <td className="py-2 text-right text-xs text-slate-600 dark:text-slate-400">{formatCurrency(item.unit_price)}</td>
              <td className="py-2 text-right font-medium text-xs text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
