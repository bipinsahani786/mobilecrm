import React from 'react';
import { Search, Package, Plus, Layers, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ProductSearchPaneProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchResults: any[];
  isLoading?: boolean;
  addToCart: (product: any, batch?: any) => void;
  className?: string;
}

export function ProductSearchPane({ className, searchQuery, setSearchQuery, searchResults, isLoading, addToCart }: ProductSearchPaneProps) {
  return (
    <div className={`w-full lg:w-2/3 flex flex-col border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0f] ${className || ''}`}>

      {/* ── Premium Search Bar ── */}
      <div className="px-4 py-3 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5">
        <div className="relative group">
          {/* Left search icon */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center group-focus-within:bg-primary-500 transition-all duration-300 pointer-events-none">
            <Search className="w-4 h-4 text-primary-500 group-focus-within:text-white transition-colors duration-300" />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Search product, IMEI, barcode…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className={[
              "w-full h-11 pl-14 pr-28 text-sm font-medium rounded-xl",
              "bg-slate-50 dark:bg-white/[0.04]",
              "border border-slate-200 dark:border-white/10",
              "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
              "focus:outline-none focus:border-primary-400 dark:focus:border-primary-500",
              "focus:ring-2 focus:ring-primary-500/20",
              "transition-all duration-200",
            ].join(' ')}
          />

          {/* Right side: count badge + clear btn + shortcut */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <>
                {/* Results count */}
                {searchResults.length > 0 && (
                  <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30 px-2 py-0.5 rounded-full">
                    {searchResults.length}
                  </span>
                )}
                {/* Clear button */}
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-150"
                >
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 p-3 rounded-xl space-y-2.5">
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
                <div className="h-5 bg-slate-200 dark:bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {searchResults.map(product => {
              const activeBatches = product.batches?.filter((b: any) => b.remaining_quantity > 0) || [];

              if (activeBatches.length > 0) {
                return activeBatches.map((batch: any) => (
                  <button
                    key={`${product.id}-${batch.id}`}
                    onClick={() => addToCart(product, batch)}
                    className="group relative text-left bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500/60 hover:shadow-md hover:shadow-primary-500/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                  >
                    {/* Hover accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                    {/* Add badge */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-sm">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5 text-primary-500" />
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate leading-tight pt-0.5">
                        {product.model_name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md truncate max-w-[120px]" title={batch.batch_number || 'N/A'}>
                        #{batch.batch_number || 'N/A'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Qty: <span className="text-slate-700 dark:text-slate-200">{batch.remaining_quantity}</span>
                      </span>
                    </div>

                    <p className="text-sm font-black text-primary-600 dark:text-primary-400 font-display">
                      {formatCurrency(batch.mrp || product.mrp)}
                    </p>
                  </button>
                ));
              }

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                  className={`group relative text-left bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500/60 hover:shadow-md hover:shadow-primary-500/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:border-slate-200`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                  {product.quantity > 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-sm">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5 text-primary-500" />
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate leading-tight pt-0.5">
                      {product.model_name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
                      Direct
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Qty: <span className="text-slate-700 dark:text-slate-200">{product.quantity}</span>
                    </span>
                  </div>

                  <p className="text-sm font-black text-primary-600 dark:text-primary-400 font-display">
                    {formatCurrency(product.mrp)}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-600 py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <Package className="w-8 h-8 opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {searchQuery ? 'No products match your search' : 'No products in inventory'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                {searchQuery ? 'Try a different name, IMEI or barcode' : 'Add products to inventory first'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
