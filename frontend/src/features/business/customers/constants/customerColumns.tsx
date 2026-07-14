import type { ColumnDef } from '@/components/ui/data-table';
import type { Customer } from '../schemas/customerSchema';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, ChevronRight, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface CustomerColumnsProps {
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onCollectPayment: (customer: Customer) => void;
}

export const getCustomerColumns = ({ onEdit, onView, onCollectPayment }: CustomerColumnsProps): ColumnDef<Customer>[] => [
  {
    header: 'Customer',
    accessorKey: 'name',
    cell: (customer) => (
      <div className="flex items-center cursor-pointer group" onClick={() => onView(customer)}>
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold font-display uppercase shrink-0">
          {customer.name.charAt(0)}
        </div>
        <div className="ml-3 group-hover:text-primary-600 transition-colors">
          <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary-600">{customer.name}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {customer.id}</p>
        </div>
      </div>
    )
  },
  {
    header: 'Contact Info',
    cell: (customer) => (
      <div className="space-y-1">
        {customer.phone && (
          <div className="flex items-center text-[10px] font-bold text-slate-400 mt-0.5">
            <Phone className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            {customer.phone}
          </div>
        )}
        {customer.address && (
          <div className="flex items-center text-[10px] font-bold text-slate-400 mt-0.5">
            <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span className="truncate max-w-[150px]">{customer.address}</span>
          </div>
        )}
      </div>
    )
  },
  {
    header: 'Outstanding Balance',
    className: 'text-right',
    cell: (customer) => {
      const billed = customer.sales_sum_final_amount || 0;
      const paid = customer.sales_sum_paid_amount || 0;
      const outstanding = billed - paid;
      return (
        <span className={cn(
          "font-bold text-xs font-display",
          outstanding > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
        )}>
          {formatCurrency(outstanding)}
        </span>
      );
    }
  },
  {
    header: '',
    className: 'text-right',
    cell: (customer) => {
      const billed = customer.sales_sum_final_amount || 0;
      const paid = customer.sales_sum_paid_amount || 0;
      const outstanding = billed - paid;
      return (
        <div className="flex justify-end gap-1.5 items-center">
          {outstanding > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl h-8 px-2.5 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onCollectPayment(customer);
              }}
            >
              Collect Payment
            </Button>
          )}
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
      );
    }
  }
];
