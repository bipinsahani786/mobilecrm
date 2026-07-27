import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCustomers } from '@/features/business/customers/api/useCustomers';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { formatCurrency } from '@/lib/formatters';
import { ArrowLeft, CheckCircle2, UserPlus, X, Banknote, Smartphone, CreditCard, IndianRupee, GitMerge, Plus } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { AddCustomerModal } from '@/features/business/customers/components/AddCustomerModal';
import { toast } from 'sonner';

interface BookingCheckoutPageProps {
  cart: any[];
  cartTotal: number;
  onCancel: () => void;
  onSuccess: (data: any) => void;
  isSubmitting: boolean;
}

export function BookingCheckoutPage({ cart, cartTotal, onCancel, onSuccess, isSubmitting }: BookingCheckoutPageProps) {
  const { data: customersData } = useCustomers(1, 1000);
  const customers = customersData?.data || [];
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('cash');
  const [splitPayments, setSplitPayments] = useState<any[]>([{ mode: 'Cash', amount: '' }, { mode: 'UPI', amount: '' }]);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      advance_amount: 0,
      booking_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: ''
    }
  });

  const formAdvance = watch('advance_amount') || 0;
  const splitTotal = splitPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const advanceAmount = paymentType === 'split' ? splitTotal : Number(formAdvance);
  const remainingAmount = cartTotal - advanceAmount;

  const handleFormSubmit = (data: any) => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    if (advanceAmount < 0) {
      toast.error('Advance amount cannot be negative');
      return;
    }
    if (advanceAmount > cartTotal) {
      toast.error('Advance amount cannot exceed total amount');
      return;
    }

    onSuccess({
      customer_id: Number(selectedCustomerId),
      items: cart.map(item => ({
        product_id: item.product_id,
        product_batch_id: item.batch_id || undefined,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      advance_amount: advanceAmount,
      payment_mode: paymentType === 'cash' ? 'Cash' : 
                   paymentType === 'upi' ? 'UPI' : 
                   paymentType === 'debit_card' ? 'Debit Card' : 
                   paymentType === 'credit_card' ? 'Credit Card' : 
                   paymentType === 'udhar' ? 'Udhar' : 'Split',
      payments: paymentType === 'split' ? splitPayments.map(p => ({
        payment_mode: p.mode,
        amount: Number(p.amount) || 0,
        notes: null
      })).filter(p => p.amount > 0) : [],
      booking_date: data.booking_date,
      expected_delivery_date: data.expected_delivery_date || undefined,
      notes: data.notes || undefined,
    });
  };

  const customerOptions = [
    { value: '', label: '— Walk-in Customer —' },
    ...customers.map((c: any) => ({
      value: String(c.id),
      label: c.name,
      description: c.phone ? `📞 ${c.phone}` : 'No phone',
      searchString: `${c.name} ${c.phone || ''}`
    }))
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col h-[calc(100vh-56px)] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden animate-in fade-in duration-200">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 relative z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-tight">Booking Checkout</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Complete Pre-booking Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Total Items:</span>
          <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-500/10 text-primary-500 border border-primary-200/50 dark:border-primary-500/20 px-2 py-0.5 rounded-full">
            {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
          </span>
        </div>
      </div>

      {/* ── Main Content Area (Spacious Split Columns, No Page Scroll on PC) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-4 bg-slate-50 dark:bg-[#0a0a0f] h-auto lg:h-[calc(100vh-100px)] relative z-20">
        
        {/* ──── LEFT COLUMN (7/12 Width): Customer & Booking Details ──── */}
        <div className="w-full lg:w-7/12 lg:overflow-y-auto lg:h-full space-y-4 lg:pr-1.5 custom-scrollbar pb-32 lg:pb-32 relative z-50">
          
          {/* 1. Customer Selection Card */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-3 animate-in slide-in-from-bottom-2 duration-300 relative z-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Customer</h3>
                <p className="text-[9px] text-slate-500">Associate booking with a customer profile</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(p => !p)}
                className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer ${
                  isQuickAddOpen
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'text-primary-500 border-primary-200 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                }`}
              >
                {isQuickAddOpen ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                {isQuickAddOpen ? 'Cancel' : 'New Customer'}
              </button>
            </div>
            
            <SearchableSelect
              value={selectedCustomerId}
              onChange={(value) => setSelectedCustomerId(String(value))}
              placeholder="Search Customer by Name, Phone, or Address..."
              options={customerOptions}
            />

            {/* Quick Add Form Modal */}
            <AddCustomerModal 
              isOpen={isQuickAddOpen} 
              onClose={() => setIsQuickAddOpen(false)} 
              onSuccess={(c) => {
                setSelectedCustomerId(String(c.id));
                setIsQuickAddOpen(false);
              }}
            />
          </div>

          {/* 2. Booking Details Card */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4 animate-in slide-in-from-bottom-2 duration-300 delay-75 z-40 relative">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Details & Dates</h3>
              <p className="text-[9px] text-slate-500">Provide advance amount, booking date, and delivery expectations</p>
            </div>
            
            <div className="space-y-4 border border-slate-100 dark:border-white/5 rounded-xl p-4 bg-slate-50/50 dark:bg-white/[0.01]">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Booking Date</label>
                  <Input type="date" {...register('booking_date')} className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expected Delivery</label>
                  <Input type="date" {...register('expected_delivery_date')} className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Additional Notes</label>
                <textarea 
                  {...register('notes')} 
                  rows={2} 
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:ring-1 focus:ring-primary-500 transition-colors resize-none text-slate-900 dark:text-white" 
                />
              </div>

            </div>
          </div>
        </div>

        {/* ──── RIGHT COLUMN (5/12 Width): Summary & Totals ──── */}
        <div className="w-full lg:w-5/12 lg:overflow-y-auto lg:h-full space-y-4 lg:pl-1.5 custom-scrollbar pb-32 lg:pb-32 relative z-10">
          
          {/* Order Summary Card */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4 relative">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</h3>
            
            <div className="max-h-[20vh] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="border border-slate-100 dark:border-white/5 rounded-xl p-3 bg-slate-50/50 dark:bg-white/[0.01]">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.model_name}</p>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                    <span className="text-[10px] font-black">{formatCurrency(item.quantity * item.unit_price)}</span>
                  </div>
                </div>

              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Cart Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Advance Paid</span>
                <span>- {formatCurrency(advanceAmount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-end justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-white leading-none">Remaining Payable:</span>
              <span className="text-xl font-black text-rose-500 dark:text-rose-400 leading-none tracking-tight">
                {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
              </span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4 relative z-50">
            <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-2xl p-3.5 flex flex-col justify-center overflow-visible">
              
              {paymentType !== 'split' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Advance Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                    <Input 
                      type="number" 
                      min={0} 
                      {...register('advance_amount')} 
                      className="pl-9 h-14 text-xl font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 focus:ring-emerald-500 shadow-sm" 
                    />
                  </div>
                </div>
              )}

              {/* Split Payments Mode */}
              {paymentType === 'split' && (
                <div className="space-y-3 w-full overflow-visible">
                  <div className="space-y-2 overflow-visible">
                    {splitPayments.map((payment, index) => (
                      <div key={index} className="flex items-center gap-1.5 group">
                        <div className="w-1/2">
                          <CustomSelect
                            value={payment.mode}
                            onChange={(value) => {
                              const newPayments = [...splitPayments];
                              newPayments[index].mode = value;
                              setSplitPayments(newPayments);
                            }}
                            options={[
                              { value: 'Cash', label: 'Cash' },
                              { value: 'UPI', label: 'UPI' },
                              { value: 'Card', label: 'Card' },
                              { value: 'Net Banking', label: 'Net Banking' },
                            ]}
                          />
                        </div>
                        <div className="flex-1 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                          <Input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => {
                              const newPayments = [...splitPayments];
                              newPayments[index].amount = e.target.value;
                              setSplitPayments(newPayments);
                            }}
                            placeholder="0.00"
                            controlSize="sm"
                            className="pl-5 bg-white dark:bg-[#0c0c0f]"
                          />
                        </div>
                        {splitPayments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPayments = splitPayments.filter((_, i) => i !== index);
                              setSplitPayments(newPayments);
                            }}
                            className="h-8 w-8 flex items-center justify-center border border-rose-200 dark:border-rose-500/15 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSplitPayments([...splitPayments, { mode: 'UPI', amount: '' }])}
                    className="flex items-center justify-center gap-1.5 w-full h-8 border border-dashed border-primary-300 dark:border-primary-500/20 hover:border-primary-500 text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Payment Mode</span>
                  </button>
                  
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-500">Total split:</span>
                      <span className="font-black text-primary-500">
                        {formatCurrency(splitTotal)}
                      </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</h3>
              <p className="text-[9px] text-slate-500">Choose how this booking advance is being paid</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'cash', label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" /> },
                { id: 'upi', label: 'UPI', icon: <Smartphone className="w-3.5 h-3.5" /> },
                { id: 'debit_card', label: 'Debit Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { id: 'credit_card', label: 'Credit Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { id: 'split', label: 'Split', icon: <GitMerge className="w-3.5 h-3.5 text-primary-500" /> },
              ].map((mode) => {
                const active = paymentType === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setPaymentType(mode.id);
                      if (mode.id === 'split' && splitPayments.length < 2) {
                        setSplitPayments([
                          { mode: 'Cash', amount: '' },
                          { mode: 'UPI', amount: '' }
                        ]);
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-1 h-14 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer ${active
                      ? 'bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20 -translate-y-0.5'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/5'
                      }`}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </div>

      {/* ── Fixed Bottom Actions Bar ── */}
      <div className="fixed lg:absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white dark:bg-[#111118] border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 px-8 text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-10 text-[11px] font-black uppercase tracking-widest text-white bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 rounded-xl transition-all shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isSubmitting ? 'Processing...' : 'Complete Booking'}
        </button>
      </div>

    </form>
  );
}
