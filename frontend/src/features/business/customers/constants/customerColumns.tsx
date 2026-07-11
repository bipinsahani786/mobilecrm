import type { ColumnDef } from '@/components/ui/data-table';
import type { Customer } from '../schemas/customerSchema';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, ChevronRight, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface CustomerColumnsProps {
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

export const getCustomerColumns = ({ onEdit, onView }: CustomerColumnsProps): ColumnDef<Customer>[] => [
  {
    header: 'Customer',
    accessorKey: 'name',
    cell: (customer) => (
      <div className="flex items-center cursor-pointer group" onClick={() => onView(customer)}>
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold font-display uppercase shrink-0">
          {customer.name.charAt(0)}
        </div>
        <div className="ml-3 group-hover:text-primary-600 transition-colors">
          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600">{customer.name}</p>
          <p className="text-xs text-slate-500">ID: {customer.id}</p>
        </div>
      </div>
    )
  },
  {
    header: 'Contact Info',
    cell: (customer) => (
      <div className="space-y-1">
        {customer.phone && (
          <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs">
            <Phone className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            {customer.phone}
          </div>
        )}
        {customer.address && (
          <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span className="truncate max-w-[150px]">{customer.address}</span>
          </div>
        )}
      </div>
    )
  },
  {
    header: 'Outstanding (Udhar)',
    className: 'text-right',
    cell: (customer) => {
      const billed = customer.sales_sum_final_amount || 0;
      const paid = customer.sales_sum_paid_amount || 0;
      const udhar = billed - paid;
      return (
        <span className={cn(
          "font-semibold font-display",
          udhar > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
        )}>
          {formatCurrency(udhar)}
        </span>
      );
    }
  },
  {
    header: '',
    className: 'text-right',
    cell: (customer) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(customer);
          }}
        >
          <Edit2 className="w-4 h-4 text-slate-500 hover:text-slate-700" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onView(customer);
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    )
  }
];
