import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBooking } from '../api/useBookings';
import { useInventory } from '@/features/business/inventory/api/useInventory';
import { ProductSearchPane } from '@/features/business/pos/components/ProductSearchPane';
import { BookingCartPane } from '../components/BookingCartPane';
import { BookingCheckoutPage } from '../components/BookingCheckoutPage';
import { toast } from 'sonner';

export default function NewBookingPage() {
  const navigate = useNavigate();
  const createMutation = useCreateBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const inventoryParams = debouncedSearch
    ? { search: debouncedSearch, per_page: 20 }
    : { per_page: 20 };

  const { data: inventoryResponse, isLoading } = useInventory(inventoryParams);
  const searchResults = inventoryResponse?.data || [];

  const addToCart = (product: any, batch?: any) => {
    const batchId = batch?.id;
    const cartItemId = batchId ? `${product.id}-${batchId}` : `${product.id}`;
    const price = batch ? (batch.mrp || product.mrp) : product.mrp;
    const maxQty = batch ? batch.remaining_quantity : product.quantity;

    if (maxQty <= 0) {
      toast.error('This product is out of stock.');
      return;
    }

    const existing = cart.find(item => item.id === cartItemId);
    if (existing) {
      if (existing.quantity >= maxQty) {
        toast.error(`Only ${maxQty} units of ${product.model_name} available.`);
        return;
      }
      setCart(prev => prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
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
        max_quantity: maxQty,
      }]);
    }
    setSearchQuery('');
  };

  const removeFromCart = (id?: string) => {
    if (id) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart([]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    if (delta > 0 && item.quantity >= item.max_quantity) {
      toast.error(`Only ${item.max_quantity} units available.`);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, Math.min(item.max_quantity, item.quantity + delta)) };
      }
      return item;
    }));
  };
  
  const updatePrice = (id: string, newPrice: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, unit_price: newPrice } : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  if (isCheckoutActive && cart.length > 0) {
    return (
      <BookingCheckoutPage
        cart={cart}
        cartTotal={cartTotal}
        onCancel={() => setIsCheckoutActive(false)}
        isSubmitting={createMutation.isPending}
        onSuccess={async (bookingData) => {
          try {
            await createMutation.mutateAsync(bookingData);
            toast.success('Booking created successfully!');
            navigate('/bookings');
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create booking');
          }
        }}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Main split pane */}
      <div className="flex-1 flex overflow-hidden">
        <ProductSearchPane
          className="flex lg:flex"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isLoading={isLoading}
          addToCart={addToCart}
        />

        <BookingCartPane
          className="hidden lg:flex"
          cart={cart}
          cartTotal={cartTotal}
          updateQuantity={updateQuantity}
          updatePrice={updatePrice}
          removeFromCart={removeFromCart}
          onCheckout={() => setIsCheckoutActive(true)}
        />
      </div>

      {/* Floating Mobile Checkout Button */}
      {cart.length > 0 && (
        <div className="lg:hidden h-14 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#111118] flex items-center justify-between px-4 relative z-30 shrink-0 select-none">
          <div className="font-bold text-sm">
            Total: {cartTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </div>
          <button
            onClick={() => setIsCheckoutActive(true)}
            className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
