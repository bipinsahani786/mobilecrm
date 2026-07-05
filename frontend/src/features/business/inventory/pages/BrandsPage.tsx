import { useState, useMemo } from 'react';
import { Tags, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useBrands, useDeleteBrand } from '../api/useBrands';
import type { Brand } from '../api/useBrands';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { BrandFormModal } from '../components/BrandFormModal';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getBrandColumns } from '../constants/brandColumns';
import { StatCard } from '@/components/ui/stat-card';

export default function BrandsPage() {
  const { data: brandsData, isLoading } = useBrands();
  const deleteMutation = useDeleteBrand();
  
  const brands = brandsData?.data || brandsData || [];
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      await deleteMutation.mutateAsync(brandToDelete.id);
      toast.success('Brand deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  const handleCreate = () => {
    setBrandToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setBrandToEdit(brand);
    setIsModalOpen(true);
  };

  const columns = useMemo(() => getBrandColumns({
    onEdit: handleEdit,
    onDelete: (brand) => setBrandToDelete(brand)
  }), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Tags}
        title="Product Brands"
        subtitle="Manage product brands"
        actions={
          <Button onClick={handleCreate} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md">
            <Plus className="w-4 h-4 mr-2" />
            Create Brand
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL BRANDS"
            value={brands.length}
            icon={Tags}
            subtitle="Active brands"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={brands}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={3} />}
          searchable={true}
          searchKeys={['name']}
          searchPlaceholder="Search brands..."
          emptyIcon={<Tags className="w-12 h-12" />}
          emptyMessage="No brands found. Create your first brand to organize your inventory."
          serverSide={false}
        />
      </div>

      <BrandFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brandToEdit={brandToEdit}
      />

      <DeleteConfirmModal
        isOpen={brandToDelete !== null}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? If there are products linked to it, the brand might be removed from those products."
        itemName={brandToDelete?.name}
        confirmText="DELETE"
      />
    </div>
  );
}
