import { useState, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Tags, Bookmark, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrands, useDeleteBrand } from '../api/useBrands';
import type { Brand } from '../schemas/brandSchema';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { BrandFormModal } from '../components/BrandFormModal';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSearch } from '@/components/ui/filter-controls';

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

  // Filter brands locally based on custom search input
  const filteredBrands = useMemo(() => {
    if (!search.trim()) return brands;
    const term = search.toLowerCase().trim();
    return brands.filter(brand => brand.name.toLowerCase().includes(term));
  }, [brands, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-8 pb-12 z-10">
        
        {/* Sleek Hero & Search Section */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              Product Brands
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              Manage your product brands beautifully. You currently have <span className="font-bold text-primary-600 dark:text-primary-400">{brands.length}</span> active brands.
            </p>
          </div>

          <div className="w-full max-w-md lg:max-w-sm flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full h-10 pl-9 pr-9 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
            ))}
          </div>
        )}

        {/* Grid Layout */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
            {/* Create New Brand Card */}
            {!search && (
              <button 
                onClick={handleCreate}
                className="group flex flex-col items-center justify-center gap-2 h-28 rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-100/50 dark:hover:bg-primary-900/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/10 active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-primary-700 dark:text-primary-400 tracking-wide">Add Brand</span>
              </button>
            )}

            {/* Brand Cards */}
            {filteredBrands.map((brand) => (
              <div 
                key={brand.id} 
                className="group relative h-28 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-primary-500/20 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 dark:bg-primary-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 dark:from-primary-500/20 dark:to-blue-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-inner">
                    <Bookmark className="w-4 h-4" />
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleEdit(brand)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 transition-colors shadow-sm"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setBrandToDelete(brand)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500 transition-colors shadow-sm"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <Tags className="w-3 h-3" />
                    <span>Brand</span>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Empty State when searching */}
        {!isLoading && filteredBrands.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 text-slate-400">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No brands found</h2>
            <p className="text-slate-500 dark:text-slate-400">We couldn't find any brand matching "{search}".</p>
            <Button onClick={() => setSearch('')} variant="outline" className="mt-6 rounded-xl">
              Clear Search
            </Button>
          </div>
        )}

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
