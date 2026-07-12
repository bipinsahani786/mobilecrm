import type { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Edit, Lock, Unlock } from 'lucide-react';
import { BusinessCell, ContactCell, StatusSelectCell } from '@/components/ui/table-cells';

interface TenantColumnsProps {
  onEdit: (tenant: any) => void;
  onStatusChange: (tenant: any, status: 'active' | 'suspended') => void;
  isUpdating: boolean;
}

export const getTenantColumns = ({
  onEdit,
  onStatusChange,
  isUpdating
}: TenantColumnsProps): ColumnDef<any>[] => [
  {
    header: 'Business',
    accessorKey: 'name',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (business) => (
      <BusinessCell 
        name={business.name} 
        gstNumber={business.gst_number} 
        logoPath={business.logo_path} 
      />
    )
  },
  {
    header: 'Owner Details',
    className: '!px-3 !py-1.5 text-xs',
    cell: (business) => (
      <ContactCell 
        name={business.owner?.name} 
        email={business.owner?.email} 
      />
    )
  },
  {
    header: 'Joined On',
    accessorKey: 'created_at',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (business) => (
      <p className="text-xs font-bold text-xs text-slate-700 dark:text-slate-300">
        {new Date(business.created_at).toLocaleDateString()}
      </p>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (business) => (
      <StatusSelectCell 
        value={business.status === 'suspended' ? 'suspended' : 'active'}
        onChange={(val) => onStatusChange(business, val as 'active' | 'suspended')}
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
    cell: (business) => (
      <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(business)}
          title="Edit Tenant"
          className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onStatusChange(business, business.status === 'suspended' ? 'active' : 'suspended')}
          disabled={isUpdating}
          title={business.status === 'suspended' ? 'Activate Tenant' : 'Suspend Tenant'}
          className={
            business.status === 'suspended'
              ? 'w-7 h-7 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center rounded-lg p-0 transition-colors'
              : 'w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center rounded-lg p-0 transition-colors'
          }
        >
          {business.status === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
        </Button>
      </div>
    )
  }
];
