import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../../inventory/api/useInventory';
import { useSale } from '../api/useSales';
import { CheckoutPage } from '../components/checkout/CheckoutPage';
import { ProductSearchPane } from '../components/ProductSearchPane';
import { CartPane } from '../components/CartPane';
import type { CartItem } from '../schemas/saleSchema';
import { toast } from 'sonner';

export default function PosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCustomerId = searchParams.get('customer_id');
  const draftIdParam = searchParams.get('draft_id');
  const editIdParam = searchParams.get('edit_id');
  const draftId = draftIdParam ? Number(draftIdParam) : (editIdParam ? Number(editIdParam) : undefined);

  const { data: draftSale, isLoading: isDraftLoading } = useSale(draftId || 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load draft items into cart if editing a draft or completed sale
  useEffect(() => {
    if (draftSale) {
      const mappedCart: CartItem[] = (draftSale.items || []).map((item: any) => ({
        id: item.product_batch_id ? `${item.product_id}-${item.product_batch_id}` : `${item.product_id}`,
        product_id: item.product_id,
        batch_id: item.product_batch_id,
        model_name: item.product?.model_name || 'Unknown Product',
        batch_number: undefined,
        unit_price: Number(item.unit_price),
        quantity: item.quantity,
        max_quantity: item.product?.quantity || 9999,
        category_name: item.product?.category?.name || '',
        imei_1: item.imei_1,
        imei_2: item.imei_2,
        serial_no: item.serial_no,
      }));
      setCart(mappedCart);
      setIsCheckoutActive(true); // auto open checkout for drafts and edits
    }
  }, [draftSale]);

  const reconstructedDraftData = React.useMemo(() => {
    if (!draftSale) return undefined;
    if (draftSale.status === 'Draft' && draftSale.draft_data) {
      const draft = { ...draftSale.draft_data };
      if (draftSale.customer) draft.customer = draftSale.customer;
      return draft;
    }
    
    // It's a completed sale, reconstruct draft_data payload format
    const draft: any = {
      customer_id: draftSale.customer_id,
      discount: draftSale.discount,
      round_off: draftSale.round_off,
      payment_mode: draftSale.payment_mode,
      notes: draftSale.notes,
      payments: draftSale.payments?.map((p: any) => {
        let link_customer_id;
        const match = p.notes?.match(/ID:\s*(\d+)/);
        if (match) link_customer_id = Number(match[1]);
        return {
          payment_mode: p.payment_mode,
          amount: Number(p.amount),
          link_customer_id
        };
      }) || [],
      items: draftSale.items?.map((item: any) => ({
        product_id: item.product_id,
        product_batch_id: item.product_batch_id,
        quantity: item.quantity,
        imei_1: item.imei_1,
        imei_2: item.imei_2,
        serial_no: item.serial_no
      })) || []
    };

    const emiData = draftSale.emiDetail || draftSale.emi_detail;
    if (emiData) {
      draft.emi_detail = {
        financier_name: emiData.financier_name,
        down_payment: emiData.down_payment,
        loan_amount: emiData.loan_amount,
        processing_fee: emiData.processing_fee,
        tenure_months: emiData.tenure_months,
        monthly_installment_amount: emiData.monthly_installment_amount,
        first_emi_date: emiData.first_emi_date,
      };
      
      const loadedDownPmts = draft.payments;
      if (loadedDownPmts.length > 1) {
         draft.emi_down_payment_mode = 'Split';
      } else if (loadedDownPmts.length === 1) {
         draft.emi_down_payment_mode = loadedDownPmts[0].payment_mode;
      } else {
         draft.emi_down_payment_mode = 'Cash';
      }
    }
    if (draftSale.customer) {
      draft.customer = draftSale.customer;
    }
    return draft;
  }, [draftSale]);

  const inventoryParams = debouncedSearch
    ? { search: debouncedSearch, per_page: 20 }
    : { per_page: 20 };

  const { data: inventoryResponse, isLoading } = useInventory(inventoryParams);
  const searchResults = inventoryResponse?.data || [];

  const addToCart = (product: any, batch?: any) => {
    const batchId = batch?.id;
    const maxQty = batch ? batch.remaining_quantity : product.quantity;

    if (maxQty <= 0) {
      toast.error('This product is out of stock.');
      return;
    }

    const cartItemId = batchId ? `${product.id}-${batchId}` : `${product.id}`;
    const price = batch ? (batch.mrp || product.mrp) : product.mrp;

    const existing = cart.find(item => item.id === cartItemId);
    if (existing) {
      if (existing.quantity >= maxQty) {
        toast.error(`Only ${maxQty} units of ${product.model_name}${batch?.batch_number ? ` (Batch: ${batch.batch_number})` : ''} available.`);
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
        category_name: product.category?.name || '',
      }]);
    }
    setSearchQuery('');
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    if (delta > 0 && item.quantity >= item.max_quantity) {
      toast.error(`Only ${item.max_quantity} units of ${item.model_name}${item.batch_number ? ` (Batch: ${item.batch_number})` : ''} available.`);
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

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  if (isCheckoutActive) {
    return (
      <CheckoutPage
        cartItems={cart}
        cartTotal={cartTotal}
        draftId={draftId}
        initialDraftData={reconstructedDraftData}
        onCancel={() => setIsCheckoutActive(false)}
        onSuccess={(saleId?: number, isDraft?: boolean) => {
          setCart([]);
          setSearchQuery('');
          setIsCheckoutActive(false);
          
          if (!isDraft && saleId) {
            navigate(`/invoices/${saleId}`);
          } else if (isDraft) {
            navigate('/invoices');
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
          onCheckout={() => setIsCheckoutActive(true)}
        />
      </div>
    </div>
  );
}
