import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { ShoppingCart } from 'lucide-react';
import { useInventory } from '../../inventory/api/useInventory';
import { CheckoutModal } from '../components/CheckoutModal';
import { ProductSearchPane } from '../components/ProductSearchPane';
import { CartPane } from '../components/CartPane';
import type { CartItem, CheckoutFormValues } from '../schemas/saleSchema';
import { toast } from 'sonner';

export default function PosPage() {
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customer_id');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: inventoryResponse, isLoading } = useInventory({ search: debouncedSearch, per_page: 12 });
  const searchResults = inventoryResponse?.data || [];

  const addToCart = (product: any, batch?: any) => {
    const batchId = batch?.id;
    const maxQty = batch ? batch.remaining_quantity : product.quantity;
    
    if (maxQty <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    
    const cartItemId = batchId ? `${product.id}-${batchId}` : `${product.id}`;
    const price = batch ? (batch.mrp || product.mrp) : product.mrp;

    const existing = cart.find(item => item.id === cartItemId);
    if (existing) {
      if (existing.quantity >= maxQty) {
        toast.error(`Only ${maxQty} units of ${product.model_name} ${batch?.batch_number ? `(Batch: ${batch.batch_number})` : ''} available in stock.`);
        return;
      }
      setCart(prev => prev.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, {
        id: cartItemId,
        product_id: product.id,
        batch_id: batchId,
        model_name: product.model_name,
        batch_number: batch?.batch_number,
        unit_price: price,
        quantity: 1,
        max_quantity: maxQty
      }]);
    }
    setSearchQuery('');
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find(x => x.id === id);
    if (!item) return;

    if (delta > 0 && item.quantity >= item.max_quantity) {
      toast.error(`Only ${item.max_quantity} units of ${item.model_name} ${item.batch_number ? `(Batch: ${item.batch_number})` : ''} available in stock.`);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(item.max_quantity, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updatePrice = (id: string, newPrice: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, unit_price: newPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      <PageHeader
        title="Point of Sale"
        subtitle="Create new bill and process checkout"
        icon={ShoppingCart}
      />

      <div className="flex-1 flex overflow-hidden">
        <ProductSearchPane 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isLoading={isLoading}
          addToCart={addToCart}
        />

        <CartPane 
          cart={cart}
          cartTotal={cartTotal}
          updateQuantity={updateQuantity}
          updatePrice={updatePrice}
          removeFromCart={removeFromCart}
          onCheckout={() => setIsCheckoutOpen(true)}
        />
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartTotal={cartTotal}
        cartItems={cart}
        onSuccess={() => {
          setCart([]);
          setSearchQuery('');
        }}
      />
    </div>
  );
}
