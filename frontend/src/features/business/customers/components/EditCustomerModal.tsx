import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormValues, type Customer } from '../schemas/customerSchema';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateCustomer } from '../api/useCustomers';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function EditCustomerModal({ isOpen, onClose, customer }: EditCustomerModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });
  const updateCustomer = useUpdateCustomer();

  useEffect(() => {
    if (customer && isOpen) {
      reset({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
      });
    }
  }, [customer, isOpen, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    if (!customer) return;
    try {
      await updateCustomer.mutateAsync({ id: customer.id, data });
      toast.success('Customer updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
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
            <Edit2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          Edit Customer
        </div>
      }
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Customer Name <span className="text-rose-500">*</span>
          </label>
          <Input 
            {...register('name')} 
            placeholder="E.g., Rahul Sharma"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <Input 
            {...register('phone')} 
            placeholder="E.g., +91 9876543210" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Address
          </label>
          <Textarea 
            {...register('address')} 
            placeholder="Customer's full address"
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
