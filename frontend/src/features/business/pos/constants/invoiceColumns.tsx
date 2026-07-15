import type { ColumnDef } from '@/components/ui/data-table';
import type { Sale } from '../schemas/saleSchema';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceColumnsProps {
  onView: (sale: Sale) => void;
  onCustomerView: (customerId: number) => void;
  onResumeDraft?: (saleId: number) => void;
}

export const getInvoiceColumns = ({ onView, onCustomerView, onResumeDraft }: InvoiceColumnsProps): ColumnDef<Sale>[] => [
  {
    header: 'Invoice',
    cell: (sale) => {
      const isUdharInvoice = sale.invoice_number?.startsWith('UDH-');
      return (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-xs text-slate-900 dark:text-white">{sale.invoice_number}</p>
            {isUdharInvoice && (
              <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded border border-rose-100 dark:border-rose-500/20">
                Udhar
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(sale.date).toLocaleDateString()}</p>
        </div>
      );
    }
  },
  {
    header: 'Customer',
    cell: (sale) => {
      const isUdharInvoice = sale.invoice_number?.startsWith('UDH-');
      const primaryCustMatch = sale.notes?.match(/Downpayment Credit \(Udhar\) for\s*([^']+)'s purchase/i);
      const primaryCustName = primaryCustMatch ? primaryCustMatch[1] : null;

      const udharPayment = sale.payments?.find(p => p.payment_mode === 'Udhar');
      const guarantorMatch = udharPayment?.notes?.match(/Udhar linked to Customer:\s*([^(|]+)/i);
      const guarantorName = guarantorMatch ? guarantorMatch[1].trim() : null;
      const guarantorIdMatch = udharPayment?.notes?.match(/ID:\s*(\d+)/i);
      const guarantorId = guarantorIdMatch ? guarantorIdMatch[1] : null;

      return (
        <div className="flex flex-col gap-1 justify-center">
          {sale.customer ? (
            <div className="cursor-pointer group/cust" onClick={() => onCustomerView(sale.customer.id)}>
              <p className="font-bold text-xs text-slate-900 dark:text-white group-hover/cust:text-primary-600 transition-colors">
                {sale.customer.name}
              </p>
              {isUdharInvoice && primaryCustName ? (
                <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 mt-0.5">
                  Udhar for: {primaryCustName}
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{sale.customer.phone || 'No phone'}</p>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 italic">Walk-in</span>
          )}

          {guarantorName && (
            <div 
              className="text-[9px] font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-500/20 w-fit cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (guarantorId) {
                  onCustomerView(Number(guarantorId));
                }
              }}
            >
              🤝 Guarantor: {guarantorName}
            </div>
          )}
        </div>
      );
    }
  },
  {
    header: 'Items',
    cell: (sale) => (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
        {sale.items?.length || 0} Items
      </span>
    )
  },
  {
    header: 'Amount',
    className: 'text-right',
    cell: (sale) => {
      const emiDetail = sale.emiDetail;
      const udharPayment = sale.payments?.find(p => p.payment_mode === 'Udhar');
      
      return (
        <div className="text-right flex flex-col items-end">
          <span className="font-black text-sm text-slate-900 dark:text-white">
            {formatCurrency(sale.final_amount)}
          </span>
          {emiDetail && (
            <span className="text-[9px] font-bold text-indigo-500 mt-0.5 whitespace-nowrap">
              Loan: {formatCurrency(emiDetail.loan_amount)}
            </span>
          )}
          {udharPayment && (
            <span className="text-[9px] font-bold text-rose-500 mt-0.5 whitespace-nowrap">
              Udhar: {formatCurrency(udharPayment.amount)}
            </span>
          )}
        </div>
      );
    }
  },
  {
    header: 'Payment Mode',
    cell: (sale) => {
      const udharPayment = sale.payments?.find(p => p.payment_mode === 'Udhar');
      const guarantorMatch = udharPayment?.notes?.match(/Udhar linked to Customer:\s*([^(|]+)/i);
      const guarantorName = guarantorMatch ? guarantorMatch[1].trim() : null;

      return (
        <div className="flex flex-col gap-1">
          <span className="w-fit inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            {sale.payment_mode || 'Multiple'}
          </span>
          {udharPayment && guarantorName && (
            <span className="w-fit inline-flex items-center text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1 py-0.5 rounded border border-rose-100 dark:border-rose-500/20 whitespace-nowrap">
              Udhar: {guarantorName} ({formatCurrency(udharPayment.amount)})
            </span>
          )}
        </div>
      );
    }
  },
  {
    header: 'Status',
    cell: (sale) => {
      const isDraft = sale.status === 'Draft';
      return (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isDraft ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {sale.status || 'completed'}
          </span>
          {isDraft && onResumeDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onResumeDraft(sale.id);
              }}
              className="h-6 px-2 text-[9px] font-bold text-amber-600 border-amber-200 hover:bg-amber-50 transition-opacity"
            >
              Resume
            </Button>
          )}
        </div>
      );
    }
  },
  {
    header: '',
    className: 'text-right',
    cell: (sale) => (
      <div className="flex items-center justify-end gap-2 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onView(sale);
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    )
  }
];
