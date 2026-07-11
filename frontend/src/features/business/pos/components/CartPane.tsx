import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import type { CartItem } from '../schemas/saleSchema';

interface CartPaneProps {
  cart: CartItem[];
  cartTotal: number;
  updateQuantity: (id: string, delta: number) => void;
  updatePrice: (id: string, price: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
}

export function CartPane({ cart, cartTotal, updateQuantity, updatePrice, removeFromCart, onCheckout }: CartPaneProps) {
  return (
    <div className="w-1/3 flex flex-col bg-slate-50 dark:bg-slate-900/50">
      <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#09090b]">
        <h2 className="font-semibold text-lg flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-primary-500" />
          Current Order
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map(item => (
          <div key={item.id} className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white leading-tight">{item.model_name}</h4>
                {item.batch_number && <p className="text-xs text-slate-500 mt-1">Batch: {item.batch_number}</p>}
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-end mt-4">
              <div className="w-24">
                <label className="text-xs text-slate-500 mb-1 block">Price</label>
                <Input 
                  type="number" 
                  value={item.unit_price} 
                  onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                  className="h-8 text-sm px-2"
                />
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {cart.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            Cart is empty
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#09090b] border-t border-slate-200 dark:border-white/5 p-4 space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount</span>
          <span className="text-primary-600 dark:text-primary-400 font-display text-2xl">
            {formatCurrency(cartTotal)}
          </span>
        </div>
        <Button 
          className="w-full h-14 text-lg" 
          size="lg"
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
