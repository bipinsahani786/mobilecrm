import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../inventory/api/useInventory';
import { ProductSearchPane } from '../../pos/components/ProductSearchPane';
import { CartPane } from '../../pos/components/CartPane';
import type { CartItem } from '../../pos/schemas/saleSchema';
import { useCreateQuotation } from '../api/useQuotations';
import { useCustomers } from '../../customers/api/useCustomers';
import { toast } from 'sonner';
import { Search, ShoppingBag, ArrowLeft, Save, User, Calendar, FileText, UserPlus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { AddCustomerModal } from '../../customers/components/AddCustomerModal';

export default function CreateQuotationPage() {
  const navigate = useNavigate();
  const createMutation = useCreateQuotation();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');

  // Quotation fields
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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

  const { data: customersData } = useCustomers(1, 100, { search: customerSearch || undefined });
  const customers = customersData?.data || [];

  const addToCart = (product: any, batch?: any) => {
    const batchId = batch?.id;
    const maxQty = batch ? batch.remaining_quantity : product.quantity;
    const cartItemId = batchId ? `${product.id}-${batchId}` : `${product.id}`;
    const price = batch ? (batch.mrp || product.mrp) : product.mrp;

    const existing = cart.find(item => item.id === cartItemId);
    if (existing) {
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
        max_quantity: maxQty || 9999,
        category_name: product.category?.name || '',
      }]);
    }
    setSearchQuery('');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
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
  const finalAmount = cartTotal - discount + roundOff;

  const selectedCustomer = customers.find((c: any) => c.id === customerId);

  const handleSaveQuotation = async () => {
    if (cart.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      toast.loading('Saving quotation...', { id: 'save-quotation' });
      const quotationData = {
        customer_id: customerId,
        discount,
        round_off: roundOff,
        notes: notes || null,
        valid_until: validUntil || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_batch_id: item.batch_id || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const result = await createMutation.mutateAsync(quotationData);
      toast.success(`Quotation ${result.quotation_number} created!`, { id: 'save-quotation' });
      navigate('/quotations');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save', { id: 'save-quotation' });
    }
  };

  const customerOptions = [
    { value: '', label: '— Walk-in Customer —' },
    ...customers.map((c: any) => ({
      value: String(c.id),
      label: c.name,
      description: c.phone ? `📞 ${c.phone}` : 'No phone',
      searchString: `${c.name} ${c.phone || ''} ${c.address || ''}`,
    })),
  ];

  // Checkout/Summary view
  if (showCheckout) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-56px)] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden animate-in fade-in duration-200">
        
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 relative z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-tight">Save Quotation</h1>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Quotation Details & Summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Total Items:</span>
            <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-500/10 text-primary-500 border border-primary-200/50 dark:border-primary-500/20 px-2 py-0.5 rounded-full">
              {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
            </span>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-4 bg-slate-50 dark:bg-[#0a0a0f] h-auto lg:h-[calc(100vh-100px)]">

          {/* ──── LEFT COLUMN (7/12 Width): Customer & Details ──── */}
          <div className="w-full lg:w-7/12 lg:overflow-y-auto lg:h-full space-y-4 lg:pr-1.5 custom-scrollbar pb-6">

            {/* Customer Selection Card */}
            <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Customer</h3>
                  <p className="text-[9px] text-slate-500">Associate this quotation with a customer profile</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(p => !p)}
                  className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer ${isQuickAddOpen
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'text-primary-500 border-primary-200 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                    }`}
                >
                  {isQuickAddOpen ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                  {isQuickAddOpen ? 'Cancel' : 'New Customer'}
                </button>
              </div>

              <SearchableSelect
                value={customerId ? String(customerId) : ''}
                onChange={(val) => setCustomerId(val ? Number(val) : null)}
                options={customerOptions}
                placeholder="Search Customer by Name, Phone, or Address..."
                controlSize="sm"
              />

              {/* Quick Add Form Modal */}
              <AddCustomerModal 
                isOpen={isQuickAddOpen} 
                onClose={() => setIsQuickAddOpen(false)} 
                onSuccess={(c: any) => {
                  setCustomerId(c.id);
                  setIsQuickAddOpen(false);
                }}
              />
            </div>

            {/* Quotation Details Card */}
            <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotation Settings</h3>
                <p className="text-[9px] text-slate-500">Validity and additional notes</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Valid Until</label>
                  <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes / Terms</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Enter any notes, terms or conditions..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-500 resize-none transition-colors" />
                </div>
              </div>
            </div>

          </div>

          {/* ──── RIGHT COLUMN (5/12 Width): Bill Summary ──── */}
          <div className="w-full lg:w-5/12 h-full flex flex-col lg:border-l border-slate-200 dark:border-white/5 lg:pl-5 space-y-4 relative">
            
            <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Quotation Summary</h3>
              </div>

              {/* Items List (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b border-slate-100 dark:border-white/5 last:border-0 group">
                    <div className="pr-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-primary-500 transition-colors">{item.model_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-semibold text-slate-500 uppercase">{item.quantity} × {formatCurrency(item.unit_price)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0 mt-0.5">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Adjustments */}
              <div className="shrink-0 space-y-3 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400">Discount (₹)</span>
                    <input type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="0"
                      className="w-full h-9 pl-24 pr-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-right text-rose-500 focus:outline-none focus:border-primary-500 transition-colors" />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400">Round Off</span>
                    <input type="number" step="0.01" value={roundOff || ''} onChange={(e) => setRoundOff(Number(e.target.value))} placeholder="0"
                      className="w-full h-9 pl-[70px] pr-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-right text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div className="shrink-0 bg-slate-900 dark:bg-black rounded-xl p-3 flex items-center justify-between border border-slate-800 dark:border-white/10 shadow-inner">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{cart.length} items</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white tracking-tight">{formatCurrency(finalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button onClick={handleSaveQuotation} disabled={createMutation.isPending}
              className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer">
              <Save className="w-4 h-4" />
              {createMutation.isPending ? 'Saving...' : 'Save Quotation'}
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Back Button */}
      <div className="px-4 py-2 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <button onClick={() => navigate('/quotations')}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">New Quotation</h1>
      </div>

      {/* Main split pane */}
      <div className="flex-1 flex overflow-hidden">
        <ProductSearchPane
          className={`${activeTab === 'products' ? 'flex' : 'hidden'} lg:flex`}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isLoading={isLoading}
          addToCart={addToCart}
        />

        <CartPane
          className={`${activeTab === 'cart' ? 'flex' : 'hidden'} lg:flex`}
          cart={cart}
          cartTotal={cartTotal}
          updateQuantity={updateQuantity}
          updatePrice={updatePrice}
          removeFromCart={removeFromCart}
          onCheckout={() => setShowCheckout(true)}
        />
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden h-14 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#111118] flex items-center justify-around px-4 relative z-30 shrink-0">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase tracking-wider transition-colors ${activeTab === 'products' ? 'text-primary-500' : 'text-slate-400'}`}
        >
          <Search className="w-5 h-5" />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase tracking-wider transition-colors relative ${activeTab === 'cart' ? 'text-primary-500' : 'text-slate-400'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 text-[9px] font-black text-white bg-primary-500 w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#111118]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <span>Cart (₹{cartTotal.toLocaleString('en-IN')})</span>
        </button>
      </div>
    </div>
  );
}
