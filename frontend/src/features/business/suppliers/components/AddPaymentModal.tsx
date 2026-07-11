import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, IndianRupee } from 'lucide-react';
import { useCreateSupplierPayment } from '../api/useSuppliers';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { paymentFormConfig } from '../constants/paymentForm';
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
      payment_mode: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const { reset, formState: { isSubmitting } } = form;
  const createPayment = useCreateSupplierPayment();

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset({
        amount: 0,
        payment_mode: 'cash',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        supplier_purchase_id: supplierPurchaseId,
      });
    }
  }, [isOpen, reset, supplierPurchaseId]);

  const onSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    try {
      await createPayment.mutateAsync({
        supplierId,
        data,
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
      <DynamicForm 
        id="payment-form"
        form={form}
        onSubmit={onSubmit}
        sections={paymentFormConfig}
      />
    </Modal>
  );
}
