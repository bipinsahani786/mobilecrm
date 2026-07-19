import type { ColumnDef } from '@/components/ui/data-table';
import type { Sale } from '../schemas/saleSchema';
import { Button } from '@/components/ui/button';
import { ChevronRight, MessageCircle, FileDown, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceColumnsProps {
  onView: (sale: Sale) => void;
  onCustomerView: (customerId: number) => void;
  onResumeDraft?: (saleId: number) => void;
  onDownloadPdf?: (sale: Sale, withLetterhead: boolean) => void;
  onWhatsAppShare?: (sale: Sale) => void;
  onThermalPrint?: (sale: Sale) => void;
}

export const getInvoiceColumns = ({ onView, onCustomerView, onResumeDraft, onDownloadPdf, onWhatsAppShare, onThermalPrint }: InvoiceColumnsProps): ColumnDef<Sale>[] => [
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
      <div className="flex items-center justify-end gap-1.5 transition-opacity">
        {onWhatsAppShare && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-[#25D366] hover:text-[#1ebe5d] hover:bg-[#25D366]/10"
            title="Share on WhatsApp"
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppShare(sale);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </Button>
        )}
        {onDownloadPdf && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-[9px] font-bold text-slate-500 border-slate-200 hover:text-primary-600 hover:bg-slate-50 gap-1 uppercase tracking-wider"
              title="Print on your pre-printed blank letterhead"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadPdf(sale, false);
              }}
            >
              <FileDown className="w-3 h-3" />
              Blank PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-[9px] font-bold text-primary-500 border-primary-200 hover:text-primary-600 hover:bg-primary-50 gap-1 uppercase tracking-wider"
              title="Print with digital letterhead"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadPdf(sale, true);
              }}
            >
              <Printer className="w-3 h-3" />
              Letterhead
            </Button>
          </>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 ml-1"
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
