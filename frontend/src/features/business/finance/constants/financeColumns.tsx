import type { ColumnDef } from '@/components/ui/data-table';
import type { EmiDetail } from '../schemas/financeSchema';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface FinanceColumnsProps {
  onMarkReceived: (emi: EmiDetail) => void;
}

export const getFinanceColumns = ({ onMarkReceived }: FinanceColumnsProps): ColumnDef<EmiDetail>[] => [
  {
    header: 'Date & Invoice',
    cell: (emi) => (
      <div>
        <p className="font-bold text-xs text-slate-900 dark:text-white">{emi.sale?.invoice_number}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(emi.sale?.date || '').toLocaleDateString()}</p>
      </div>
    )
  },
  {
    header: 'Customer',
    cell: (emi) => (
      <div>
        <p className="font-bold text-xs text-slate-900 dark:text-white">{emi.sale?.customer?.name || 'Walk-in'}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{emi.sale?.customer?.phone}</p>
      </div>
    )
  },
  {
    header: 'Financier',
    cell: (emi) => (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
        {emi.financier_name}
      </span>
    )
  },
  {
    header: 'Loan Details',
    cell: (emi) => (
      <div className="text-xs text-slate-600 dark:text-slate-400">
        <p>Loan: {formatCurrency(emi.loan_amount)}</p>
        {emi.processing_fee > 0 && <p className="text-rose-500">Fee: -{formatCurrency(emi.processing_fee)}</p>}
      </div>
    )
  },
  {
    header: 'Expected Payout',
    className: 'text-right',
    cell: (emi) => {
      const expected = emi.loan_amount - emi.processing_fee;
      return (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(expected)}
        </span>
      );
    }
  },
  {
    header: 'Status',
    className: 'text-right',
    cell: (emi) => {
      if (emi.is_payout_received) {
        return (
          <div className="text-right flex flex-col items-end">
            <span className="inline-flex items-center text-xs font-bold text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Received
            </span>
            {emi.payout_date && <p className="text-[10px] font-bold text-slate-400 mt-0.5 mt-1">{new Date(emi.payout_date).toLocaleDateString()}</p>}
          </div>
        );
      }
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onMarkReceived(emi)}
          className="text-primary-600 border-primary-200 hover:bg-primary-50 dark:border-primary-900/50 dark:hover:bg-primary-900/20"
        >
          Mark Received
        </Button>
      );
    }
  }
];
