import React from 'react';
import { Search, Package, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

interface ProductSearchPaneProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchResults: any[];
  isLoading?: boolean;
  addToCart: (product: any, batch?: any) => void;
}

export function ProductSearchPane({ searchQuery, setSearchQuery, searchResults, isLoading, addToCart }: ProductSearchPaneProps) {
  return (
    <div className="w-2/3 flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#09090b]">
      <div className="p-4 border-b border-slate-200 dark:border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search products by name, IMEI, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-[#09090b]">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3"
              >
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {searchResults.map(product => {
              const activeBatches = product.batches?.filter((b: any) => b.remaining_quantity > 0) || [];
              
              if (activeBatches.length > 0) {
                return activeBatches.map((batch: any) => (
                  <div 
                    key={`${product.id}-${batch.id}`}
                    onClick={() => addToCart(product, batch)}
                    className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg cursor-pointer hover:border-primary-500 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary-500/10 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate pr-4">
                      {product.model_name}
                    </h4>
                    <div className="flex justify-between items-center mt-1.5 text-xs text-slate-500">
                      <span className="truncate max-w-[90px] font-medium bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-[10px]">Batch: {batch.batch_number || 'N/A'}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Qty: {batch.remaining_quantity}</span>
                    </div>
                    <div className="mt-2 font-display font-bold text-base text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(batch.mrp || product.mrp)}
                    </div>
                  </div>
                ));
              }

              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg cursor-pointer hover:border-primary-500 hover:shadow-md transition-all group relative overflow-hidden ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {product.quantity > 0 && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary-500/10 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate pr-4">
                    {product.model_name}
                  </h4>
                  <div className="flex justify-between items-center mt-1.5 text-xs text-slate-500">
                    <span className="font-medium bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-[10px]">No Batches</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Qty: {product.quantity}</span>
                  </div>
                  <div className="mt-2 font-display font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.mrp)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Package className="w-16 h-16 opacity-20" />
            <p>
              {searchQuery 
                ? "No products match your search query." 
                : "No products available in inventory."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
