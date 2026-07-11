import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useCreateSale } from '../api/useSales';
import { useCustomers, useCreateCustomer } from '../../customers/api/useCustomers';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { OrderSummary } from './checkout/OrderSummary';
import { PaymentForms } from './checkout/PaymentForms';
import type { PaymentMode } from '../constants/index';
import type { CartItem } from '../schemas/saleSchema';
import { Plus } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  cartItems: CartItem[];
  onSuccess: () => void;
}

export function CheckoutModal({ isOpen, onClose, cartTotal, cartItems, onSuccess }: CheckoutModalProps) {
  const [paymentType, setPaymentType] = useState<PaymentMode>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
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
    if (!quickCustName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: quickCustName.trim(),
        phone: quickCustPhone.trim() || undefined,
        address: quickCustAddress.trim() || undefined
      });
      
      toast.success('Customer added successfully!');
      setSelectedCustomerId(String(newCustomer.id));
      setIsQuickAddOpen(false);
      setQuickCustName('');
      setQuickCustPhone('');
      setQuickCustAddress('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    }
  };

  const discount = watch('discount') || 0;
  const roundOff = watch('round_off') || 0;
  const finalAmount = cartTotal - Number(discount) + Number(roundOff);

  const splitCash = watch('split_cash') || 0;
  const splitUpi = watch('split_upi') || 0;
  const splitCard = watch('split_card') || 0;

  const emiDownPayment = watch('emi_down_payment') || 0;
  const emiLoanAmount = watch('emi_loan_amount') || 0;
  const emiTenure = watch('emi_tenure') || 0;

  useEffect(() => {
    if (isOpen) {
      setValue('discount', 0);
      setValue('round_off', 0);
      setPaymentType('cash');
    }
  }, [isOpen, setValue]);
  
  useEffect(() => {
    if (paymentType === 'emi') {
      const loan = Math.max(0, finalAmount - Number(emiDownPayment));
      setValue('emi_loan_amount', loan);
      
      if (Number(emiTenure) > 0) {
        setValue('emi_monthly_amount', (loan / Number(emiTenure)).toFixed(2));
      }
    }
  }, [finalAmount, emiDownPayment, emiTenure, paymentType, setValue]);

  const onSubmit = async (data: any) => {
    if (!selectedCustomerId && paymentType === 'emi') {
      toast.error('Customer is required for EMI sales');
      return;
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
      }))
    };

    if (paymentType === 'cash') {
      payload.payment_mode = 'Cash';
      payload.payments = [
        { payment_mode: 'Cash', amount: finalAmount }
      ];
    } else if (paymentType === 'split') {
      payload.payment_mode = 'Split';
      payload.payments = [];
      if (Number(splitCash) > 0) payload.payments.push({ payment_mode: 'Cash', amount: Number(splitCash) });
      if (Number(splitUpi) > 0) payload.payments.push({ payment_mode: 'UPI', amount: Number(splitUpi) });
      if (Number(splitCard) > 0) payload.payments.push({ payment_mode: 'Card', amount: Number(splitCard) });
      
      const totalSplit = Number(splitCash) + Number(splitUpi) + Number(splitCard);
      if (totalSplit > finalAmount) {
        toast.error('Split payment total exceeds final amount');
        return;
      }
    } else if (paymentType === 'emi') {
      payload.payment_mode = 'EMI';
      payload.payments = [];
      if (Number(emiDownPayment) > 0) {
        payload.payments.push({ payment_mode: 'Cash', amount: Number(emiDownPayment), notes: 'EMI Down Payment' });
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
      await createSale.mutateAsync(payload);
      toast.success('Sale completed successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Checkout"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <OrderSummary 
              cartTotal={cartTotal} 
              finalAmount={finalAmount} 
              register={register} 
            />

            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider">
                Customer Details
              </label>
              <div className="flex gap-2">
                <Select 
                  value={selectedCustomerId} 
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="flex-1 h-9 text-sm bg-slate-50 dark:bg-white/[0.02]"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  className={`h-9 px-3 flex items-center justify-center rounded-lg transition-colors ${isQuickAddOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : ''}`}
                  onClick={() => setIsQuickAddOpen(prev => !prev)}
                  title="Quick Add Customer"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {isQuickAddOpen && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Full Name *" 
                      value={quickCustName} 
                      onChange={(e) => setQuickCustName(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-black"
                    />
                    <Input 
                      placeholder="Phone Number" 
                      value={quickCustPhone} 
                      onChange={(e) => setQuickCustPhone(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-black"
                    />
                  </div>
                  <Input 
                    placeholder="Address (Optional)" 
                    value={quickCustAddress} 
                    onChange={(e) => setQuickCustAddress(e.target.value)}
                    className="h-8 text-xs w-full bg-white dark:bg-black"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="h-7 px-3 text-xs font-medium text-slate-500 hover:text-slate-700" 
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        setQuickCustName('');
                        setQuickCustPhone('');
                        setQuickCustAddress('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      className="h-7 px-4 text-xs font-medium"
                      onClick={handleQuickAddCustomer}
                      disabled={createCustomer.isPending}
                    >
                      {createCustomer.isPending ? 'Saving...' : 'Save Customer'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <PaymentForms 
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              register={register}
              splitCash={splitCash}
              splitUpi={splitUpi}
              splitCard={splitCard}
              finalAmount={finalAmount}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} className="h-9 px-6 text-sm font-medium">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="h-9 px-8 text-sm font-semibold min-w-[140px] shadow-sm">
            {isSubmitting ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
