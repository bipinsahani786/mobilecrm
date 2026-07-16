import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { CartItem } from '../schemas/saleSchema';

interface CartPaneProps {
  cart: CartItem[];
  cartTotal: number;
  updateQuantity: (id: string, delta: number) => void;
  updatePrice: (id: string, price: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
  className?: string;
}

export function CartPane({ className, cart, cartTotal, updateQuantity, updatePrice, removeFromCart, onCheckout }: CartPaneProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`w-full lg:w-1/3 flex flex-col bg-white dark:bg-[#111118] border-l border-slate-200 dark:border-white/5 ${className || ''}`}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/30">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Current Order</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => cart.forEach(item => removeFromCart(item.id))}
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
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Cart is empty</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Search and add products to the left</p>
            </div>
          </div>
        ) : (
          cart.map(item => (
            <div
              key={item.id}
              className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] rounded-xl p-3 group hover:border-primary-200 dark:hover:border-primary-500/20 transition-all"
            >
              {/* Product name + delete */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    {item.model_name}
                  </h4>
                  {item.batch_number && (
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      Batch: {item.batch_number}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-500 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price + Qty controls */}
              <div className="flex items-center justify-between gap-2">
                {/* Price input */}
                <div className="flex flex-col min-w-0">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={item.unit_price}
                      min="0"
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                      className="w-24 h-7 pl-5 pr-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Qty stepper */}
                <div className="flex flex-col items-end">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Qty</label>
                  <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-white/5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white border-x border-slate-200 dark:border-white/10">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.max_quantity}
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

      {/* Footer: Total + Checkout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
        {/* Subtotal rows */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Discount / Tax</span>
            <span className="font-semibold">Set at checkout</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">
          <span className="text-xs font-black uppercase tracking-widest text-primary-700 dark:text-primary-300">Total</span>
          <span className="text-xl font-black text-primary-600 dark:text-primary-400 font-display">
            {formatCurrency(cartTotal)}
          </span>
        </div>

        {/* Checkout button */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full h-11 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Checkout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
