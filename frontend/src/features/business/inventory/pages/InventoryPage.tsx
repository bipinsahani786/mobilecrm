import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, DollarSign, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useInventory, useDeleteProduct } from '../api/useInventory';
import type { Product } from '../api/useInventory';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { InventoryFormModal } from '../components/InventoryFormModal';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getInventoryColumns } from '../constants/inventoryColumns';
import { StatCard } from '@/components/ui/stat-card';
import { FilterContainer, FilterSearch, FilterReset } from '@/components/ui/filter-controls';

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: inventoryData, isLoading } = useInventory({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteProduct();
  const products = inventoryData?.data ?? [];
  const totalItems = inventoryData?.meta?.total ?? 0;

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleCreate = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const columns = useMemo(() => getInventoryColumns({
    onEdit: handleEdit,
    onDelete: (product) => setProductToDelete(product)
  }), []);

  // Calculate simple stats based on current page data (ideally this comes from backend metadata)
  const lowStockCount = products.filter(p => p.quantity <= 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Package}
        title="Inventory"
        subtitle="Manage your products, stock, and pricing"
        actions={
          <Button onClick={handleCreate} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="TOTAL PRODUCTS"
            value={totalItems}
            icon={Package}
            subtitle="Items in inventory"
          />
          <StatCard
            title="LOW STOCK"
            value={lowStockCount}
            icon={AlertTriangle}
            subtitle="Products with qty <= 10"
            color="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500"
          />
          <StatCard
            title="EST. INVENTORY VALUE"
            value={`₹${totalValue.toLocaleString()}`}
            icon={DollarSign}
            subtitle="Based on purchase price"
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500"
          />
        </div>

        {/* Filters & Data Table */}
        <FilterContainer>
          <FilterSearch
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="SEARCH PRODUCTS BY BRAND, MODEL..."
            wrapperClassName="flex-1 min-w-[280px]"
          />
          {search && (
            <FilterReset
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
            />
          )}
        </FilterContainer>

        <DataTable
          data={products}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={8} cols={5} />}
          searchable={false}
          emptyIcon={<Package className="w-12 h-12" />}
          emptyMessage="No products found matching your criteria."
          serverSide={true}
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
        />
      </div>

      <InventoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
      />

      <DeleteConfirmModal
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
        itemName={`${productToDelete?.brand} ${productToDelete?.model_name}`}
        confirmText="DELETE"
      />
    </div>
  );
}
