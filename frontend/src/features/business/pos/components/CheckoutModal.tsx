import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useCreateSale } from '../api/useSales';
import { useCustomers, useCreateCustomer } from '../../customers/api/useCustomers';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { OrderSummary } from './checkout/OrderSummary';
import { PaymentForms } from './checkout/PaymentForms';
import type { PaymentMode } from '../constants/index';
import type { CartItem } from '../schemas/saleSchema';
import { Plus, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  cartItems: CartItem[];
  onSuccess: () => void;
}

export function CheckoutModal({ isOpen, onClose, cartTotal, cartItems, onSuccess }: CheckoutModalProps) {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<PaymentMode>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [splitPayments, setSplitPayments] = useState<{ mode: string; amount: string; link_customer_id?: string }[]>([
    { mode: 'Cash', amount: '' }
  ]);
  const [emiDownPayments, setEmiDownPayments] = useState<{ mode: string; amount: string; link_customer_id?: string }[]>([
    { mode: 'Cash', amount: '' }
  ]);
  const [isManualEmi, setIsManualEmi] = useState(false);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickCustName, setQuickCustName] = useState('');
  const [quickCustPhone, setQuickCustPhone] = useState('');
  const [quickCustAddress, setQuickCustAddress] = useState('');

  const { data: customersResponse } = useCustomers(1, 100);
  const customers = customersResponse?.data || [];

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm();
  const createSale = useCreateSale();
  const createCustomer = useCreateCustomer();

  const handleQuickAddCustomer = async () => {
    if (!quickCustName.trim()) { toast.error('Customer name is required'); return; }
    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: quickCustName.trim(),
        phone: quickCustPhone.trim() || undefined,
        address: quickCustAddress.trim() || undefined,
      });
      toast.success('Customer added!');
      setSelectedCustomerId(String(newCustomer.id));
      setIsQuickAddOpen(false);
      setQuickCustName(''); setQuickCustPhone(''); setQuickCustAddress('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    }
  };

  const discount    = watch('discount')    || 0;
  const roundOff    = watch('round_off')   || 0;
  const finalAmount = cartTotal - Number(discount) + Number(roundOff);

  const splitTotal = splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const emiDownPaymentMode = watch('emi_down_payment_mode') || 'Cash';
  const emiSingleDown = watch('emi_down_payment') || 0;
  
  const emiDownPayment = emiDownPaymentMode === 'Split' 
    ? emiDownPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : Number(emiSingleDown);
    
  const emiTenure = watch('emi_tenure') || 0;

  useEffect(() => {
    if (isOpen) { 
      setValue('discount', 0); 
      setValue('round_off', 0); 
      setPaymentType('cash'); 
      setSplitPayments([{ mode: 'Cash', amount: '' }]);
      setEmiDownPayments([{ mode: 'Cash', amount: '' }]);
      setIsManualEmi(false);
    }
  }, [isOpen, setValue]);

  useEffect(() => {
    if (paymentType === 'emi') {
      const loan = Math.max(0, finalAmount - Number(emiDownPayment));
      setValue('emi_loan_amount', loan);
      if (!isManualEmi && Number(emiTenure) > 0) {
        setValue('emi_monthly_amount', (loan / Number(emiTenure)).toFixed(2));
      }
    }
  }, [finalAmount, emiDownPayment, emiTenure, paymentType, setValue, isManualEmi]);

  const onSubmit = async (data: any) => {
    if (!selectedCustomerId && paymentType === 'emi') {
      toast.error('Customer is required for EMI sales'); return;
    }

    // Validate EMI fields if payment mode is EMI
    if (paymentType === 'emi') {
      if (!data.emi_financier) {
        toast.error('Financier name is required for EMI sales');
        return;
      }
      if (!data.emi_tenure || Number(data.emi_tenure) <= 0) {
        toast.error('Please enter a valid tenure in months');
        return;
      }
      if (!data.emi_first_date) {
        toast.error('First EMI Date is required');
        return;
      }
    }

    const payload: any = {
      customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
      discount: Number(data.discount || 0),
      round_off: Number(data.round_off || 0),
      date: new Date().toISOString().split('T')[0],
      items: cartItems.map(item => ({
        product_id: item.product_id,
        product_batch_id: item.batch_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    if (paymentType === 'cash') {
      payload.payment_mode = 'Cash';
      payload.payments = [{ payment_mode: 'Cash', amount: finalAmount }];
    } else if (paymentType === 'split') {
      payload.payment_mode = 'Split';
      
      const hasEmptyUdhar = splitPayments.some(p => p.mode === 'Udhar' && !p.link_customer_id);
      if (hasEmptyUdhar) {
        toast.error('Please select a debtor customer for Udhar credit payments.');
        return;
      }
      const hasZeroUdhar = splitPayments.some(p => p.mode === 'Udhar' && (!p.amount || Number(p.amount) <= 0));
      if (hasZeroUdhar) {
        toast.error('Please enter a valid amount greater than 0 for Udhar credit payments.');
        return;
      }

      payload.payments = splitPayments
        .filter(p => Number(p.amount) > 0)
        .map(p => ({ 
          payment_mode: p.mode, 
          amount: Number(p.amount),
          link_customer_id: p.link_customer_id ? Number(p.link_customer_id) : undefined
        }));
      
      const totalPaid = payload.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPaid > finalAmount) {
        toast.error('Split payment total exceeds final amount'); return;
      }
    } else if (paymentType === 'emi') {
      payload.payment_mode = 'EMI';
      payload.payments = [];
      
      if (emiDownPaymentMode === 'Split') {
        const hasEmptyUdhar = emiDownPayments.some(p => p.mode === 'Udhar' && !p.link_customer_id);
        if (hasEmptyUdhar) {
          toast.error('Please select a debtor customer for Udhar credit downpayments.');
          return;
        }
        const hasZeroUdhar = emiDownPayments.some(p => p.mode === 'Udhar' && (!p.amount || Number(p.amount) <= 0));
        if (hasZeroUdhar) {
          toast.error('Please enter a valid amount greater than 0 for Udhar credit downpayments.');
          return;
        }

        emiDownPayments
          .filter(p => Number(p.amount) > 0)
          .forEach(p => {
            payload.payments.push({
              payment_mode: p.mode,
              amount: Number(p.amount),
              link_customer_id: p.link_customer_id ? Number(p.link_customer_id) : undefined,
              notes: `EMI Down Payment (${p.mode})`
            });
          });
      } else {
        if (emiDownPayment > 0)
          payload.payments.push({ 
            payment_mode: emiDownPaymentMode, 
            amount: emiDownPayment, 
            notes: `EMI Down Payment (${emiDownPaymentMode})` 
          });
      }

      payload.emi_detail = {
        financier_name: data.emi_financier,
        down_payment: Number(emiDownPayment),
        loan_amount: Number(data.emi_loan_amount),
        processing_fee: Number(data.emi_processing_fee || 0),
        tenure_months: data.emi_tenure ? Number(data.emi_tenure) : null,
        monthly_installment_amount: data.emi_monthly_amount ? Number(data.emi_monthly_amount) : null,
        first_emi_date: data.emi_first_date || null,
      };
    }

    try {
      const response = await createSale.mutateAsync(payload);
      toast.success('Sale completed successfully!');
      onSuccess(); 
      onClose();
      if (response && response.id) {
        navigate(`/invoices/${response.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    }
  };

  if (!isOpen) return null;

  // Build customer options for SearchableSelect
  const customerOptions = [
    { value: '', label: '— Walk-in Customer —' },
    ...customers.map((c: any) => ({
      value: String(c.id),
      label: c.name,
      description: c.phone ? `📞 ${c.phone}` : 'No phone',
      searchString: `${c.name} ${c.phone || ''} ${c.address || ''}`,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Checkout" maxWidth="3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Left — Order Summary + Customer */}
          <div className="space-y-4">
            <OrderSummary cartTotal={cartTotal} finalAmount={finalAmount} register={register} />

            {/* Customer Section */}
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Customer
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(p => !p)}
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all duration-150 ${
                    isQuickAddOpen
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/30'
                      : 'text-primary-500 border-primary-200 dark:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                  }`}
                >
                  {isQuickAddOpen ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                  {isQuickAddOpen ? 'Cancel' : 'New'}
                </button>
              </div>

              <SearchableSelect
                value={selectedCustomerId}
                onChange={(val) => setSelectedCustomerId(String(val))}
                options={customerOptions}
                placeholder="Search Customer by Name, Phone, or Address..."
              />

              {/* Quick Add Form */}
              {isQuickAddOpen && (
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Quick Add Customer</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Full Name *"
                      value={quickCustName}
                      onChange={(e) => setQuickCustName(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Phone Number"
                      value={quickCustPhone}
                      onChange={(e) => setQuickCustPhone(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Input
                    placeholder="Address (Optional)"
                    value={quickCustAddress}
                    onChange={(e) => setQuickCustAddress(e.target.value)}
                    className="h-8 text-xs w-full"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleQuickAddCustomer}
                      disabled={createCustomer.isPending}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black rounded-lg shadow-sm shadow-primary-500/30 transition-all disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      {createCustomer.isPending ? 'Saving…' : 'Save Customer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Payment */}
          <div>
            <PaymentForms
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              register={register}
              splitPayments={splitPayments}
              setSplitPayments={setSplitPayments}
              finalAmount={finalAmount}
              emiDownPaymentMode={emiDownPaymentMode}
              setEmiDownPaymentMode={(val) => setValue('emi_down_payment_mode', val)}
              emiDownPayments={emiDownPayments}
              setEmiDownPayments={setEmiDownPayments}
              customers={customers}
              isManualEmi={isManualEmi}
              setIsManualEmi={setIsManualEmi}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="h-10 px-6 text-sm font-bold rounded-xl"
          >
            Cancel
          </Button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-8 min-w-[150px] text-sm font-black uppercase tracking-widest bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {isSubmitting ? 'Processing…' : '✓ Complete Sale'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
