import { useState, useMemo } from 'react';
import { Tags, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useBrands, useDeleteBrand } from '../api/useBrands';
import type { Brand } from '../schemas/brandSchema';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { BrandFormModal } from '../components/BrandFormModal';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getBrandColumns } from '../constants/brandColumns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterContainer, FilterSearch } from '@/components/ui/filter-controls';

export default function BrandsPage() {
  const { data: brandsData, isLoading } = useBrands();
  const deleteMutation = useDeleteBrand();
  
  const brands = brandsData || [];
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

  // Search state
  const [search, setSearch] = useState('');

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

  // Filter brands locally based on custom search input
  const filteredBrands = useMemo(() => {
    if (!search.trim()) return brands;
    const term = search.toLowerCase().trim();
    return brands.filter(brand => brand.name.toLowerCase().includes(term));
  }, [brands, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Tags}
        title="Product Brands"
        subtitle="Manage product brands"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Premium Control Panel */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-sm">
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Brands"
                  value={brands.length}
                  icon={<Tags />}
                  glowColor="primary"
                  subtitle="Active brands"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button 
                onClick={handleCreate}
                className="group relative flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden w-full sm:w-auto justify-center"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Create Brand</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {search && (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                onClick={() => setSearch('')}
                className="h-10 px-4 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable
            data={filteredBrands}
            columns={columns}
            isLoading={isLoading}
            loadingSkeleton={<TableSkeleton rows={5} cols={3} />}
            searchable={false}
            emptyIcon={<Tags className="w-12 h-12" />}
            emptyMessage={
              search 
                ? "No brands found matching your search term."
                : "No brands found. Create your first brand to organize your inventory."
            }
            serverSide={false}
          />
        </div>
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
