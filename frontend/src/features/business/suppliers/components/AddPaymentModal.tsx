import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, IndianRupee } from 'lucide-react';
import { useCreateSupplierPayment, useSupplier } from '../api/useSuppliers';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { paymentFormConfig } from '../constants/paymentForm';
import { formatCurrency } from '@/lib/formatters';
import { paymentSchema, type PaymentFormValues } from '../schemas/paymentSchema';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number;
  supplierPurchaseId?: number;
}

export function AddPaymentModal({ isOpen, onClose, supplierId, supplierPurchaseId }: AddPaymentModalProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: 0,
      payment_mode: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      split_cash: 0,
      split_upi: 0,
      split_debit_card: 0,
      split_credit_card: 0,
    },
  });

  const { reset, formState: { isSubmitting }, watch, setValue } = form;
  const createPayment = useCreateSupplierPayment();
  const { data: supplier } = useSupplier(supplierId);

  // Calculate due details
  const targetPurchase = supplierPurchaseId ? supplier?.purchases?.find((p: any) => p.id === supplierPurchaseId) : null;
  const unpaidPurchases = supplier?.purchases?.filter((p: any) => (p.bill_amount - p.paid_amount) > 0) || [];
  const totalDue = unpaidPurchases.reduce((sum: number, p: any) => sum + (p.bill_amount - p.paid_amount), 0);

  // Watch split fields to auto-calculate total amount
  const splitCash = watch('split_cash');
  const splitUpi = watch('split_upi');
  const splitDebit = watch('split_debit_card');
  const splitCredit = watch('split_credit_card');
  const paymentMode = watch('payment_mode');

  React.useEffect(() => {
    if (paymentMode === 'Split Payment') {
      const total = (Number(splitCash) || 0) + (Number(splitUpi) || 0) + (Number(splitDebit) || 0) + (Number(splitCredit) || 0);
      setValue('amount', total);
    }
  }, [splitCash, splitUpi, splitDebit, splitCredit, paymentMode, setValue]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset({
        amount: 0,
        payment_mode: 'Cash',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        supplier_purchase_id: supplierPurchaseId,
        split_cash: 0,
        split_upi: 0,
        split_debit_card: 0,
        split_credit_card: 0,
      });
      
      // Auto-fill amount if paying specific bill
      if (supplierPurchaseId && supplier) {
        const purchase = supplier.purchases?.find((p: any) => p.id === supplierPurchaseId);
        if (purchase) {
          setValue('amount', purchase.bill_amount - purchase.paid_amount);
        }
      }
    }
  }, [isOpen, reset, supplierPurchaseId, supplier, setValue]);

  const onSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    try {
      const payload: any = {
        supplier_purchase_id: data.supplier_purchase_id,
        date: data.date,
        notes: data.notes,
        payments: [],
      };

      if (data.payment_mode === 'Split Payment') {
        if (data.split_cash) payload.payments.push({ amount: data.split_cash, payment_mode: 'Cash' });
        if (data.split_upi) payload.payments.push({ amount: data.split_upi, payment_mode: 'UPI' });
        if (data.split_debit_card) payload.payments.push({ amount: data.split_debit_card, payment_mode: 'Debit Card' });
        if (data.split_credit_card) payload.payments.push({ amount: data.split_credit_card, payment_mode: 'Credit Card' });
      } else {
        payload.payments.push({ amount: data.amount, payment_mode: data.payment_mode });
      }

      await createPayment.mutateAsync({
        supplierId,
        data: payload,
      });
      toast.success('Payment recorded successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          {supplierPurchaseId ? 'Pay Bill' : 'Record Payment to Supplier'}
        </div>
      }
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="payment-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Payment
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Due Details Panel */}
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-4">
          {supplierPurchaseId ? (
            targetPurchase ? (
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Bill #{targetPurchase.id}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Dated: {new Date(targetPurchase.purchase_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-rose-600">{formatCurrency(targetPurchase.bill_amount - targetPurchase.paid_amount)}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-widest">Due Amount</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading bill details...</p>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Total Outstanding</h4>
                <p className="text-sm font-black text-rose-600">{formatCurrency(totalDue)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unpaid Bills ({unpaidPurchases.length})</p>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {unpaidPurchases.length > 0 ? unpaidPurchases.map((p: any) => (
                    <div key={p.id} className="flex justify-between text-xs py-1">
                      <span className="text-slate-600 dark:text-slate-400">Bill #{p.id} ({new Date(p.purchase_date).toLocaleDateString()})</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(p.bill_amount - p.paid_amount)}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500">No pending bills.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DynamicForm 
          id="payment-form"
        form={form}
        onSubmit={onSubmit}
          sections={paymentFormConfig}
        />
      </div>
    </Modal>
  );
}
