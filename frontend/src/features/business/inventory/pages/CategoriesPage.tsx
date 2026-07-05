import { useState, useMemo } from 'react';
import { Building2, Plus, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCategories, useDeleteCategory } from '../api/useCategories';
import type { Category } from '../api/useCategories';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getCategoryColumns } from '../constants/categoryColumns';
import { StatCard } from '@/components/ui/stat-card';

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();
  
  const categories = categoriesData?.data ?? [];
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteMutation.mutateAsync(categoryToDelete.id);
      toast.success('Category deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const columns = useMemo(() => getCategoryColumns({
    onEdit: handleEdit,
    onDelete: (category) => setCategoryToDelete(category)
  }), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Building2}
        title="Product Categories"
        subtitle="Manage inventory categories"
        actions={
          <Button onClick={handleCreate} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md">
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL CATEGORIES"
            value={categories.length}
            icon={Tags}
            subtitle="Active categories"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={categories}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={3} />}
          searchable={true}
          searchKeys={['name']}
          searchPlaceholder="Search categories..."
          emptyIcon={<Building2 className="w-12 h-12" />}
          emptyMessage="No categories found. Create your first category to organize your inventory."
          serverSide={false}
        />
      </div>

      <CategoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      <DeleteConfirmModal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? If there are products linked to it, deletion might fail."
        itemName={categoryToDelete?.name}
        confirmText="DELETE"
      />
    </div>
  );
}
