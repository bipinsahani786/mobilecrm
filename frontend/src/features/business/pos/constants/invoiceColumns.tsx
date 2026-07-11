import type { ColumnDef } from '@/components/ui/data-table';
import type { Sale } from '../schemas/saleSchema';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceColumnsProps {
  onView: (sale: Sale) => void;
  onCustomerView: (customerId: number) => void;
}

export const getInvoiceColumns = ({ onView, onCustomerView }: InvoiceColumnsProps): ColumnDef<Sale>[] => [
  {
    header: 'Invoice',
    cell: (sale) => (
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{sale.invoice_number}</p>
        <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleDateString()}</p>
      </div>
    )
  },
  {
    header: 'Customer',
    cell: (sale) => (
      <div className="flex items-center">
        {sale.customer ? (
          <div className="cursor-pointer group" onClick={() => onCustomerView(sale.customer.id)}>
            <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
              {sale.customer.name}
            </p>
            <p className="text-xs text-slate-500">{sale.customer.phone || 'No phone'}</p>
          </div>
        ) : (
          <span className="text-slate-500 italic">Walk-in</span>
        )}
      </div>
    )
  },
  {
    header: 'Items',
    cell: (sale) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300">
        {sale.items?.length || 0} Items
      </span>
    )
  },
  {
    header: 'Amount',
    className: 'text-right font-medium',
    cell: (sale) => formatCurrency(sale.final_amount)
  },
  {
    header: 'Payment Mode',
    cell: (sale) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
        {sale.payment_mode || 'Multiple'}
      </span>
    )
  },
  {
    header: 'Status',
    cell: (sale) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 capitalize">
        {sale.status}
      </span>
    )
  },
  {
    header: '',
    className: 'text-right',
    cell: (sale) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
