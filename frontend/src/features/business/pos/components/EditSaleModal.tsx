import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useUpdateSale } from '../api/useSales';
import { useCustomers } from '../../customers/api/useCustomers';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { OrderSummary } from './checkout/OrderSummary';
import { PaymentForms } from './checkout/PaymentForms';
import type { PaymentMode } from '../constants/index';
import type { Sale } from '../schemas/saleSchema';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  isEmiPaid: boolean;
}

export function EditSaleModal({ isOpen, onClose, sale, isEmiPaid }: EditSaleModalProps) {
  const [paymentType, setPaymentType] = useState<PaymentMode>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [splitPayments, setSplitPayments] = useState<{ mode: string; amount: string; link_customer_id?: string }[]>([
    { mode: 'Cash', amount: '' }
  ]);
  
  // Local cart state for editing items
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [emiDownPayments, setEmiDownPayments] = useState<{ mode: string; amount: string; link_customer_id?: string }[]>([
    { mode: 'Cash', amount: '' }
  ]);
  const [isManualEmi, setIsManualEmi] = useState(false);
  
  const { data: customersResponse } = useCustomers(1, 100);
  const customers = customersResponse?.data || [];
  
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm();
  const updateSale = useUpdateSale();

  // Initialize form with sale data
  useEffect(() => {
    if (isOpen && sale) {
      setSelectedCustomerId(sale.customer_id ? String(sale.customer_id) : '');
      setValue('discount', sale.discount || 0);
      setValue('round_off', sale.round_off || 0);
      
      let pMode: PaymentMode = 'cash';
      if (sale.payment_mode === 'Split') pMode = 'split';
      if (sale.payment_mode === 'EMI') pMode = 'emi';
      setPaymentType(pMode);

      if (pMode === 'split' && sale.payments) {
        const loadedPayments = sale.payments.map((p: any) => {
          let linkCustomerId: string | undefined;
          const match = p.notes?.match(/ID:\s*(\d+)/);
          if (match) {
            linkCustomerId = match[1];
          }
          return {
            mode: p.payment_mode,
            amount: String(p.amount),
            link_customer_id: linkCustomerId
          };
        });
        setSplitPayments(loadedPayments.length > 0 ? loadedPayments : [{ mode: 'Cash', amount: '' }]);
      } else {
        setSplitPayments([{ mode: 'Cash', amount: '' }]);
      }

      if (pMode === 'emi' && sale.emiDetail) {
        setValue('emi_financier', sale.emiDetail.financier_name);
        setValue('emi_down_payment', sale.emiDetail.down_payment);
        setValue('emi_loan_amount', sale.emiDetail.loan_amount);
        setValue('emi_processing_fee', sale.emiDetail.processing_fee);
        setValue('emi_tenure', sale.emiDetail.tenure_months);
        setValue('emi_monthly_amount', sale.emiDetail.monthly_installment_amount);
        setValue('emi_first_date', sale.emiDetail.first_emi_date);
        
        const calculated = (Number(sale.emiDetail.loan_amount) / Number(sale.emiDetail.tenure_months || 1)).toFixed(2);
        const actual = Number(sale.emiDetail.monthly_installment_amount).toFixed(2);
        setIsManualEmi(calculated !== actual);
        
        if (sale.payments) {
          const loadedDownPmts = sale.payments.map((p: any) => {
            let linkCustomerId: string | undefined;
            const match = p.notes?.match(/ID:\s*(\d+)/);
            if (match) {
              linkCustomerId = match[1];
            }
            return {
              mode: p.payment_mode,
              amount: String(p.amount),
              link_customer_id: linkCustomerId
            };
          });
          setEmiDownPayments(loadedDownPmts.length > 0 ? loadedDownPmts : [{ mode: 'Cash', amount: '' }]);
          setValue('emi_down_payment_mode', loadedDownPmts.length > 1 ? 'Split' : (loadedDownPmts[0]?.mode || 'Cash'));
        } else {
          setEmiDownPayments([{ mode: 'Cash', amount: '' }]);
          setValue('emi_down_payment_mode', 'Cash');
        }
      } else {
        setEmiDownPayments([{ mode: 'Cash', amount: '' }]);
        setValue('emi_down_payment_mode', 'Cash');
      }

      const initialCart = sale.items?.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        batch_id: item.product_batch_id,
        model_name: item.product?.model_name,
        batch_number: item.batch?.batch_number,
        unit_price: item.unit_price,
        quantity: item.quantity,
      })) || [];
      setCartItems(initialCart);
    }
  }, [isOpen, sale, setValue]);

  const updateQuantity = (index: number, delta: number) => {
    setCartItems(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty < 1) return prev;
      next[index].quantity = newQty;
      return next;
    });
  };

  const removeItem = (index: number) => {
    setCartItems(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const discount = watch('discount') || 0;
  const roundOff = watch('round_off') || 0;
  const finalAmount = cartTotal - Number(discount) + Number(roundOff);

  // Dynamic splitPayments replaces static watches
  const emiDownPaymentMode = watch('emi_down_payment_mode') || 'Cash';
  const emiSingleDown = watch('emi_down_payment') || 0;
  
  const emiDownPayment = emiDownPaymentMode === 'Split' 
    ? emiDownPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : Number(emiSingleDown);
    
  const emiTenure = watch('emi_tenure') || 0;

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
    if (cartItems.length === 0) {
      toast.error('Cannot save an invoice with no items.');
      return;
    }
    if (!selectedCustomerId && paymentType === 'emi') {
      toast.error('Customer is required for EMI sales');
      return;
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
      date: sale.date,
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
        toast.error('Split payment total exceeds final amount');
        return;
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
        if (emiDownPayment > 0) {
          payload.payments.push({ 
            payment_mode: emiDownPaymentMode, 
            amount: emiDownPayment, 
            notes: `EMI Down Payment (${emiDownPaymentMode})` 
          });
        }
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
      await updateSale.mutateAsync({ id: sale.id, data: payload });
      toast.success('Sale updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update sale');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Invoice"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-1">
        
        {isEmiPaid && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <strong>Warning:</strong> EMI installments have already been paid for this invoice. Editing is disabled to maintain ledger integrity.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 opacity-100 transition-opacity" style={{ opacity: isEmiPaid ? 0.6 : 1, pointerEvents: isEmiPaid ? 'none' : 'auto' }}>
          
          {/* Left Side: Items & Summary */}
          <div className="space-y-4">
            
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                Edit Items (Quantities)
              </label>
              
              <div className="max-h-[200px] overflow-y-auto mb-4 border rounded-md">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium text-right">Price</th>
                      <th className="px-3 py-2 font-medium text-center">Qty</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cartItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <p className="font-medium text-xs truncate max-w-[150px]">{item.model_name}</p>
                          {item.batch_number && <p className="text-[10px] text-slate-500">Batch: {item.batch_number}</p>}
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => updateQuantity(idx, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-xs">-</button>
                            <span className="w-4 text-xs">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(idx, 1)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-xs">+</button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">Note: To add entirely new items, please delete this invoice and create a new one from POS.</p>
            </div>

            <OrderSummary 
              cartTotal={cartTotal} 
              finalAmount={finalAmount} 
              register={register} 
            />
          </div>

          {/* Right Side: Customer & Payments */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider">
                Customer Details
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CustomSelect 
                    value={selectedCustomerId} 
                    onChange={setSelectedCustomerId}
                    placeholder="Walk-in Customer"
                    options={[
                      { label: 'Walk-in Customer', value: '' },
                      ...customers.map((c: any) => ({
                        label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`,
                        value: String(c.id)
                      }))
                    ]}
                  />
                </div>
              </div>
            </div>

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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} className="h-9 px-6 text-sm font-medium">Cancel</Button>
          {!isEmiPaid && (
            <Button type="submit" disabled={isSubmitting} className="h-9 px-8 text-sm font-semibold min-w-[140px] shadow-sm">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
