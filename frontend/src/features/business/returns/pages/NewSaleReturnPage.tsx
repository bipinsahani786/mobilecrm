import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateSaleReturn, useReturnableItems } from '../api/useSaleReturns';
import { useSales } from '@/features/business/pos/api/useSales';
import { InvoiceSearchPane } from '../components/InvoiceSearchPane';
import { ReturnCartPane } from '../components/ReturnCartPane';
import { ReturnCheckoutPage } from '../components/ReturnCheckoutPage';
import { toast } from 'sonner';

export default function NewSaleReturnPage() {
  const { saleId: initialSaleId } = useParams();
  const navigate = useNavigate();
  const createMutation = useCreateSaleReturn();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string>(initialSaleId ? String(initialSaleId) : '');
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);

  const { data: salesData } = useSales(1, 1000);
  const sales = salesData?.data || [];

  const { data: returnableData, isLoading: isLoadingReturnable } = useReturnableItems(Number(selectedSaleId) || 0);
  const returnableItems = returnableData?.returnable_items || [];

  // When selected sale changes, clear the cart
  useEffect(() => {
    setCart([]);
  }, [selectedSaleId]);

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.sale_item_id === item.sale_item_id);
    
    if (existing) {
      if (existing.quantity >= item.returnable_quantity) {
        toast.error(`Cannot return more than ${item.returnable_quantity} items.`);
        return;
      }
      setCart(prev => prev.map(c =>
        c.sale_item_id === item.sale_item_id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart(prev => [...prev, {
        sale_item_id: item.sale_item_id,
        product: item.product,
        returnable_quantity: item.returnable_quantity,
        quantity: 1,
        unit_price: item.unit_price,
      }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.sale_item_id === id) {
        const newQty = c.quantity + delta;
        if (newQty > c.returnable_quantity) return c;
        return { ...c, quantity: Math.max(1, newQty) };
      }
      return c;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.sale_item_id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  if (isCheckoutActive && cart.length > 0) {
    return (
      <ReturnCheckoutPage
        cart={cart}
        cartTotal={cartTotal}
        saleId={selectedSaleId}
        sales={sales}
        onCancel={() => setIsCheckoutActive(false)}
        isSubmitting={createMutation.isPending}
        onSuccess={async (payload) => {
          try {
            await createMutation.mutateAsync({
              ...payload,
              return_date: new Date().toISOString().split('T')[0]
            });
            toast.success('Return processed successfully!');
            navigate('/sale-returns');
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to process return');
          }
        }}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Main split pane */}
      <div className="flex-1 flex overflow-hidden">
        <InvoiceSearchPane
          className="flex lg:flex"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sales={sales}
          selectedSaleId={selectedSaleId}
          setSelectedSaleId={setSelectedSaleId}
          returnableItems={returnableItems}
          isLoadingReturnable={isLoadingReturnable}
          addToCart={addToCart}
        />

        <ReturnCartPane
          className="hidden lg:flex"
          cart={cart}
          cartTotal={cartTotal}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          onCheckout={() => setIsCheckoutActive(true)}
        />
      </div>

      {/* Floating Mobile Checkout Button */}
      {cart.length > 0 && (
        <div className="lg:hidden h-14 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#111118] flex items-center justify-between px-4 relative z-30 shrink-0 select-none">
          <div className="font-bold text-sm">
            Refund: {cartTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </div>
          <button
            onClick={() => setIsCheckoutActive(true)}
            className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"
          >
            Refund
          </button>
        </div>
      )}
    </div>
  );
}
