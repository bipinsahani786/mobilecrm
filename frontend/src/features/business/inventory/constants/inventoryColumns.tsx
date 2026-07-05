import type { ColumnDef } from '@/components/ui/data-table';
import type { Product } from '../api/useInventory';
import { MetaCell } from '@/components/ui/table-cells';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface InventoryColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const getInventoryColumns = ({ onEdit, onDelete }: InventoryColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'brand',
    header: 'Product',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <MetaCell 
        title={`${item.brand} ${item.model_name}`} 
        subtitle={item.category?.name || 'Uncategorized'}
      />
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Stock',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => {
      const qty = item.quantity;
      const status = qty > 10 ? 'active' : qty > 0 ? 'pending' : 'lost'; 
      return (
        <StatusBadge 
          status={status}
          label={`${qty} units`} 
          showIcon={false}
        />
      );
    },
  },
  {
    accessorKey: 'purchase_price',
    header: 'Purchase Price',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <span className="font-medium text-slate-700 dark:text-slate-300">
        ₹{item.purchase_price.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: 'mrp',
    header: 'MRP',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <span className="font-bold text-slate-900 dark:text-white">
        ₹{item.mrp.toLocaleString()}
      </span>
    ),
  },
  {
    header: 'Actions',
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (item) => (
      <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          title="Edit Product"
          className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          title="Delete Product"
          className="w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  },
];
