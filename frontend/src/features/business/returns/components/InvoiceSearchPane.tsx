import React from 'react';
import { Search, FileText, Plus, Box, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface InvoiceSearchPaneProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sales: any[];
  selectedSaleId: string;
  setSelectedSaleId: (id: string) => void;
  returnableItems: any[];
  isLoadingReturnable: boolean;
  addToCart: (item: any) => void;
  className?: string;
}

export function InvoiceSearchPane({ 
  className, 
  searchQuery, 
  setSearchQuery, 
  sales, 
  selectedSaleId, 
  setSelectedSaleId,
  returnableItems,
  isLoadingReturnable,
  addToCart
}: InvoiceSearchPaneProps) {
  
  // Filter sales based on search query (invoice number or customer name)
  const filteredSales = sales.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.invoice_number?.toLowerCase().includes(q) || s.customer?.name?.toLowerCase().includes(q) || s.customer?.phone?.includes(q);
  });

  return (
    <div className={`w-full lg:w-2/3 flex flex-col border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0f] ${className || ''}`}>

      {/* ── Premium Search Bar ── */}
      <div className="px-4 py-3 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5">
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center group-focus-within:bg-primary-500 transition-all duration-300 pointer-events-none">
            <Search className="w-4 h-4 text-primary-500 group-focus-within:text-white transition-colors duration-300" />
          </div>

          <input
            type="text"
            placeholder={selectedSaleId ? "Search within returnable items..." : "Search Invoice by # or Customer..."}
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

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-150"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!selectedSaleId ? (
          // View: Invoice Selection
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSales.map(sale => (
              <button
                key={sale.id}
                onClick={() => {
                  setSelectedSaleId(String(sale.id));
                  setSearchQuery('');
                }}
                className="group relative text-left bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500/60 hover:shadow-md hover:shadow-primary-500/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                <div className="flex items-start gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate leading-tight pt-0.5">
                      {sale.invoice_number}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{sale.customer?.name || 'Walk-in'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {formatDate(sale.date)}
                  </span>
                </div>

                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {formatCurrency(sale.final_amount)}
                </p>
              </button>
            ))}
            {filteredSales.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No invoices found matching your search.
              </div>
            )}
          </div>
        ) : (
          // View: Returnable Items for Selected Invoice
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-[#111118] p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-bold">Selected Invoice: {sales.find(s => String(s.id) === selectedSaleId)?.invoice_number}</span>
              </div>
              <button 
                onClick={() => { setSelectedSaleId(''); setSearchQuery(''); }}
                className="text-xs font-bold text-primary-500 hover:text-primary-600 uppercase tracking-widest px-2 py-1 bg-primary-50 dark:bg-primary-500/10 rounded-md"
              >
                Change Invoice
              </button>
            </div>

            {isLoadingReturnable ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 p-3 rounded-xl space-y-2.5">
                    <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
                    <div className="h-5 bg-slate-200 dark:bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : returnableItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No returnable items found in this invoice.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {returnableItems
                  .filter(item => !searchQuery || item.product?.model_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(item => (
                  <button
                    key={item.sale_item_id}
                    onClick={() => addToCart(item)}
                    disabled={item.returnable_quantity <= 0}
                    className="group relative text-left bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500/60 hover:shadow-md hover:shadow-primary-500/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                    {item.returnable_quantity > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-sm">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                        <Box className="w-3.5 h-3.5 text-primary-500" />
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate leading-tight pt-0.5">
                        {item.product?.model_name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Max Return: <span className="text-slate-700 dark:text-slate-200">{item.returnable_quantity}</span>
                      </span>
                    </div>

                    <p className="text-sm font-black text-primary-600 dark:text-primary-400 font-display">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
