import type { ColumnDef } from '@/components/ui/data-table';
import type { Category } from '../schemas/categorySchema';
import { MetaCell } from '@/components/ui/table-cells';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface CategoryColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const getCategoryColumns = ({ onEdit, onDelete }: CategoryColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: 'name',
    header: 'Category Name',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => <MetaCell title={item.name} />,
  },
  {
    accessorKey: 'products_count',
    header: 'Products',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
        {item.products_count || 0} items
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    className: '!px-3 !py-1.5 text-xs',
    cell: (item) => (
      <MetaCell 
        title={new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })} 
        subtitle="Added recently" 
      />
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
          title="Edit Category"
          className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          title="Delete Category"
          className="w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  },
];
