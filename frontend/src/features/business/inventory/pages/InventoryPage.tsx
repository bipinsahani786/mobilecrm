import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, DollarSign, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useInventory, useDeleteProduct } from '../api/useInventory';
import type { Product } from '../schemas/productSchema';
import { useCategories } from '../api/useCategories';
import { useBrands } from '../api/useBrands';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { InventoryFormModal } from '../components/InventoryFormModal';
import { DirectAddModal } from '../components/DirectAddModal';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getInventoryColumns } from '../constants/inventoryColumns';
import { StatCard } from '@/components/ui/stat-card';
import { FilterContainer, FilterSearch, FilterReset } from '@/components/ui/filter-controls';

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [brandId, setBrandId] = useState<number | undefined>();
  const [lowStockDays, setLowStockDays] = useState<string>('');
  const debouncedSearch = useDebounce(search, 400);
  const debouncedLowStockDays = useDebounce(lowStockDays, 600);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, brandId, debouncedLowStockDays]);

  const { data: inventoryData, isLoading } = useInventory({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    category_id: categoryId,
    brand_id: brandId,
    low_stock_days: debouncedLowStockDays || undefined,
  });

  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  const deleteMutation = useDeleteProduct();
  const products = inventoryData?.data ?? [];
  const totalItems = inventoryData?.meta?.total ?? 0;

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectAddModalOpen, setIsDirectAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToAddStock, setProductToAddStock] = useState<Product | null>(null);

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

  const handleAddStock = (product: Product) => {
    setProductToAddStock(product);
    setIsDirectAddModalOpen(true);
  };

  const columns = useMemo(() => getInventoryColumns({
    onEdit: handleEdit,
    onDelete: (product) => setProductToDelete(product),
    onAddStock: handleAddStock
  }), []);

  // Calculate simple stats based on current page data (ideally this comes from backend metadata)
  const lowStockCount = products.filter(p => p.quantity <= 10).length;
  const totalValue = products.reduce((sum, p: any) => sum + (p.inventory_value || (p.quantity * p.purchase_price)), 0);

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
            wrapperClassName="flex-1 min-w-[200px]"
          />
          <div className="flex-1 min-w-[150px]">
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-10 px-3 bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium appearance-none"
            >
              <option value="">All Categories</option>
              {categoriesData?.data?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <select
              value={brandId || ''}
              onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-10 px-3 bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium appearance-none"
            >
              <option value="">All Brands</option>
              {brandsData?.map((brand: any) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px] relative">
            <input
              type="number"
              placeholder="Low Stock (Qty)"
              value={lowStockDays}
              onChange={(e) => setLowStockDays(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          {(search || categoryId || brandId || lowStockDays) && (
            <FilterReset
              onClick={() => {
                setSearch('');
                setCategoryId(undefined);
                setBrandId(undefined);
                setLowStockDays('');
                setPage(1);
              }}
            />
          )}
        </FilterContainer>

        <DataTable
          data={products}
          renderSubComponent={(product) => {
            const activeBatches = (product.batches || []).filter((b: any) => b.remaining_quantity > 0);
            if (activeBatches.length === 0) return (
              <div className="p-4 bg-slate-50/50 dark:bg-white/[0.01] text-sm text-slate-500 text-center">
                No active batches found for this product.
              </div>
            );
            return (
              <div className="p-4 bg-slate-50/50 dark:bg-[#09090b] border-t border-slate-100 dark:border-white/5">
                <div className="max-w-3xl">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Batch Details</h4>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10">
                        <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">Batch #</th>
                        <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">Remaining Stock</th>
                        <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">Purchase Price</th>
                        <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">MRP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {activeBatches.map((batch: any) => (
                        <tr key={batch.id}>
                          <td className="py-2">
                            {batch.batch_number ? (
                              <span className="font-medium text-slate-700 dark:text-slate-200">{batch.batch_number}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">Standard</span>
                            )}
                          </td>
                          <td className="py-2 font-bold text-amber-600 dark:text-amber-500">{batch.remaining_quantity}</td>
                          <td className="py-2 text-emerald-600 dark:text-emerald-500">₹{Number(batch.purchase_price).toLocaleString()}</td>
                          <td className="py-2 font-medium">₹{Number(batch.mrp || product.mrp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }}
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

      <DirectAddModal
        isOpen={isDirectAddModalOpen}
        onClose={() => setIsDirectAddModalOpen(false)}
        product={productToAddStock}
      />

      <DeleteConfirmModal
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
        itemName={[productToDelete?.brand?.name, productToDelete?.model_name].filter(Boolean).join(' ')}
        confirmText="DELETE"
      />
    </div>
  );
}
