import type { ColumnDef } from '@/components/ui/data-table';
import type { Product } from '../schemas/productSchema';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PackagePlus, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetaCell } from '@/components/ui/table-cells';

interface InventoryColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddStock?: (product: Product) => void;
}

export const getInventoryColumns = ({ onEdit, onDelete, onAddStock }: InventoryColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'model_name',
    header: 'Product',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <div className="flex items-center gap-2">
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        <MetaCell 
          title={item.model_name} 
          subtitle={item.category?.name || 'Uncategorized'}
        />
      </div>
    ),
  },
  {
    accessorKey: 'brand_id',
    header: 'Brand',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
        {item.brand?.name || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Stock',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item: any) => {
      const activeBatches = (item.batches || []).filter((b: any) => b.remaining_quantity > 0);
      const totalStock = activeBatches.reduce((sum: number, b: any) => sum + b.remaining_quantity, 0) || item.quantity;
      return (
        <div className="flex flex-col gap-1.5 items-start">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold ${
            totalStock <= 10 
              ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
          }`}>
            {totalStock} UNITS
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'purchase_price',
    header: 'Purchase Price',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item: any) => {
      return (
        <div className="flex flex-col gap-1.5 items-start">
          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
            ₹{Number(item.purchase_price).toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'mrp',
    header: 'MRP',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item: any) => {
      return (
        <div className="flex flex-col gap-1.5 items-start">
          <span className="font-bold text-slate-900 dark:text-white">
            ₹{Number(item.mrp).toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    header: 'Actions',
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (item) => (
      <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        {onAddStock && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddStock(item)}
            title="Add Stock"
            className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
          >
            <PackagePlus className="w-3.5 h-3.5" />
          </Button>
        )}
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
