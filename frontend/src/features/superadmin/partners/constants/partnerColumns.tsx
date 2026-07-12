import type { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Edit, Lock, Unlock, Eye } from 'lucide-react';
import { ContactCell, StatusSelectCell } from '@/components/ui/table-cells';
import { format } from 'date-fns';

interface PartnerColumnsProps {
  onEdit: (partner: any) => void;
  onView: (id: number) => void;
  onStatusChange: (partner: any, status: boolean) => void;
  isUpdating: boolean;
}

export const getPartnerColumns = ({
  onEdit,
  onView,
  onStatusChange,
  isUpdating
}: PartnerColumnsProps): ColumnDef<any>[] => [
  {
    header: 'Agent / Company',
    accessorKey: 'name',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (partner) => (
      <div>
        <p className="font-bold text-slate-800 dark:text-white leading-tight">{partner.name}</p>
        <p className="text-[10px] text-slate-500 font-bold text-xs tracking-wider mt-0.5">
          {partner.company_name || 'Individual'}
        </p>
      </div>
    )
  },
  {
    header: 'Contact Details',
    className: '!px-3 !py-1.5 text-xs',
    cell: (partner) => (
      <ContactCell 
        name={partner.email} 
        phone={partner.phone} 
      />
    )
  },
  {
    header: 'Referral Code',
    accessorKey: 'referral_code',
    className: '!px-3 !py-1.5 text-xs font-mono font-bold text-xs tracking-wider text-slate-700 dark:text-slate-300',
  },
  {
    header: 'Commission',
    className: '!px-3 !py-1.5 text-xs',
    cell: (partner) => (
      <div>
        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
          {partner.commission_type === 'percentage' ? `${partner.commission_value}%` : `₹${partner.commission_value}`}
        </p>
        <p className="text-[9px] text-slate-400 font-bold text-xs uppercase tracking-wider">
          {partner.is_recurring_commission ? 'Recurring' : 'One-time'}
        </p>
      </div>
    )
  },
  {
    header: 'Clients Referred',
    accessorKey: 'businesses_count',
    sortable: true,
    className: 'text-center !px-3 !py-1.5 text-xs font-bold text-xs text-slate-800 dark:text-slate-200',
    cell: (partner) => partner.businesses_count ?? 0
  },
  {
    header: 'Joined On',
    accessorKey: 'created_at',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (partner) => (
      <p className="text-xs font-bold text-xs text-slate-600 dark:text-slate-400">
        {format(new Date(partner.created_at), 'dd MMM yyyy')}
      </p>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (partner) => (
      <StatusSelectCell 
        value={partner.status ? 'active' : 'suspended'}
        onChange={(val) => onStatusChange(partner, val === 'active')}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'suspended', label: 'Suspended' },
        ]}
        themeMap={{
          active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
          suspended: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
        }}
      />
    )
  },
  {
    header: 'Actions',
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (partner) => (
      <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onView(partner.id)}
          title="View Analytics"
          className="w-7 h-7 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(partner)}
          title="Edit Partner"
          className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onStatusChange(partner, !partner.status)}
          disabled={isUpdating}
          title={partner.status ? 'Suspend Partner' : 'Activate Partner'}
          className={
            !partner.status
              ? 'w-7 h-7 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center rounded-lg p-0 transition-colors'
              : 'w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center rounded-lg p-0 transition-colors'
          }
        >
          {partner.status ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </Button>
      </div>
    )
  }
];
