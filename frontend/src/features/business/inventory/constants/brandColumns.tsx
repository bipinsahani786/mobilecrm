import type { ColumnDef } from '@/components/ui/data-table';
import type { Brand } from '../schemas/brandSchema';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface BrandColumnsProps {
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

export const getBrandColumns = ({ onEdit, onDelete }: BrandColumnsProps): ColumnDef<Brand>[] => [
  {
    accessorKey: 'name',
    header: 'Brand Name',
    cell: (brand) => <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{brand.name}</span>,
  },
  {
    header: 'Created At',
    cell: (brand) => <span className="text-xs font-bold text-slate-500">{new Date(brand.created_at).toLocaleDateString()}</span>,
  },
  {
    header: 'Actions',
    className: 'text-right',
    cell: (brand) => (
      <div className="flex justify-end items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(brand)}
          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:text-amber-400 dark:hover:bg-amber-500/10"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(brand)}
          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    ),
  },
];
