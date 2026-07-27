import React from 'react';
import { PackageOpen, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ReturnCartPaneProps {
  cart: any[];
  cartTotal: number;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
  className?: string;
}

export function ReturnCartPane({ className, cart, cartTotal, updateQuantity, removeFromCart, onCheckout }: ReturnCartPaneProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`w-full lg:w-1/3 flex flex-col bg-white dark:bg-[#111118] border-l border-slate-200 dark:border-white/5 ${className || ''}`}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/30">
            <PackageOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Return Items</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
              {itemCount} item{itemCount !== 1 ? 's' : ''} to return
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => cart.forEach(item => removeFromCart(item.sale_item_id))}
            className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No items selected</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Select items from the invoice to return</p>
            </div>
          </div>
        ) : (
          cart.map(item => (
            <div
              key={item.sale_item_id}
              className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] rounded-xl p-3 group hover:border-primary-200 dark:hover:border-primary-500/20 transition-all"
            >
              {/* Product name + delete */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    {item.product?.model_name}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Max Returnable: {item.returnable_quantity}
                  </span>
                </div>
                <button
                  onClick={() => removeFromCart(item.sale_item_id)}
                  className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-500 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Qty controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                   <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Unit Price</span>
                   <span className="text-xs font-black text-slate-700 dark:text-slate-200">{formatCurrency(item.unit_price)}</span>
                </div>

                <div className="flex flex-col items-end">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Return Qty</label>
                  <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-white/5">
                    <button
                      onClick={() => updateQuantity(item.sale_item_id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white border-x border-slate-200 dark:border-white/10">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.sale_item_id, 1)}
                      disabled={item.quantity >= item.returnable_quantity}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Line total */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.quantity} × {formatCurrency(item.unit_price)}</span>
                <span className="text-xs font-black text-primary-600 dark:text-primary-400">
                  {formatCurrency(item.unit_price * item.quantity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: Checkout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className={`w-full py-3 rounded-xl flex items-center justify-between px-5 font-black uppercase tracking-widest text-[11px] transition-all duration-200 shadow-md active:scale-[0.98] ${
            cart.length === 0 
              ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40'
          }`}
        >
          <span>Proceed to Refund</span>
          {cart.length > 0 && <span>{formatCurrency(cartTotal)}</span>}
        </button>
      </div>

    </div>
  );
}
