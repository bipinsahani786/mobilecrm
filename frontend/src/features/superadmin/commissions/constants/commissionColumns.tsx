import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import type { Commission } from '../api/useCommissions';

interface CommissionColumnsProps {
  onMarkPaid: (id: number) => void;
  isMutating: boolean;
}

export const getCommissionColumns = ({
  onMarkPaid,
  isMutating
}: CommissionColumnsProps): ColumnDef<Commission>[] => [
  {
    header: 'Date',
    accessorKey: 'created_at',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <p className="text-xs font-bold text-[10px] font-bold text-slate-400 mt-0.5 dark:text-slate-400">
        {format(new Date(commission.created_at), 'MMM dd, yyyy')}
      </p>
    )
  },
  {
    header: 'Partner',
    className: '!px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <div>
        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">{commission.partner?.name || 'N/A'}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{commission.partner?.referral_code || 'N/A'}</p>
      </div>
    )
  },
  {
    header: 'Business / Plan',
    className: '!px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <div>
        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">{commission.business?.name || 'N/A'}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{commission.plan?.name || 'Custom Plan'}</p>
      </div>
    )
  },
  {
    header: 'Sale Amount',
    accessorKey: 'amount_paid_by_tenant',
    sortable: true,
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <div className="flex flex-col items-end">
        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
          ₹{commission.amount_paid_by_tenant}
        </p>
        {commission.payment_collected_by === 'partner' && (
          <span className="text-[9px] font-bold tracking-wide uppercase text-orange-500 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 px-1.5 py-0.5 rounded mt-0.5">
            Offline Cash
          </span>
        )}
      </div>
    )
  },
  {
    header: 'Commission',
    accessorKey: 'commission_amount',
    sortable: true,
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <p className="font-bold text-primary-600 dark:text-primary-500">
        ₹{commission.commission_amount}
      </p>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    className: 'text-center !px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <div className="flex justify-center">
        <Badge 
          className="text-[10px] font-bold tracking-wider px-2 py-0.5"
          variant={commission.status === 'paid' ? 'success' : commission.status === 'pending' ? 'warning' : 'destructive'}
        >
          {commission.status.toUpperCase()}
        </Badge>
      </div>
    )
  },
  {
    header: 'Actions',
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (commission) => (
      <div className="flex justify-end items-center gap-2" onClick={e => e.stopPropagation()}>
        {commission.status === 'pending' ? (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onMarkPaid(commission.id)} 
            disabled={isMutating} 
            title="Mark Commission Paid"
            className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        ) : (
          commission.paid_at ? (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
              Paid on {format(new Date(commission.paid_at), 'MMM dd')}
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Paid</span>
          )
        )}
      </div>
    )
  }
];
