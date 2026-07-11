import React from 'react';
import { Building2 } from 'lucide-react';

interface InvoiceHeaderProps {
  sale: any;
  activeBusiness: any;
}

export function InvoiceHeader({ sale, activeBusiness }: InvoiceHeaderProps) {
  return (
    <>
      {/* Invoice Header */}
      <div className="p-8 border-b border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">INVOICE</h1>
            <p className="text-slate-500">#{sale.invoice_number}</p>
            <p className="text-slate-500">Date: {new Date(sale.date).toLocaleDateString()}</p>
            <div className="mt-4">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Payment Mode: {sale.payment_mode || 'Multiple'}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end text-primary-600 dark:text-primary-500 mb-2">
              <Building2 className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold font-display">{activeBusiness?.name || 'Your Business'}</h2>
            </div>
            <div className="text-sm text-slate-500">
              <p>{activeBusiness?.email}</p>
              <p>{activeBusiness?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Info */}
      <div className="grid grid-cols-2 gap-8 p-8 border-b border-slate-200 dark:border-white/5">
        <div>
          <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-3">Bill To:</h3>
          {sale.customer ? (
            <>
              <p className="font-bold text-slate-900 dark:text-white text-lg">{sale.customer.name}</p>
              {sale.customer.phone && <p className="text-slate-600 dark:text-slate-400">{sale.customer.phone}</p>}
              {sale.customer.address && <p className="text-slate-600 dark:text-slate-400 max-w-xs">{sale.customer.address}</p>}
            </>
          ) : (
            <p className="font-bold text-slate-900 dark:text-white text-lg">Walk-in Customer</p>
          )}
        </div>
        {sale.user && (
          <div className="text-right">
            <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-3">Billed By:</h3>
            <p className="font-medium text-slate-900 dark:text-white">{sale.user.name}</p>
          </div>
        )}
      </div>
    </>
  );
}
