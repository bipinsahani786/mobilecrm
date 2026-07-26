import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormValues } from '../schemas/customerSchema';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCustomer } from '../api/useCustomers';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { usePinCode } from '@/hooks/usePinCode';
import { useEffect } from 'react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customer: any) => void;
}

export function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });
  const createCustomer = useCreateCustomer();
  const { fetchPinCodeDetails, isLoading: isPinLoading } = usePinCode();

  const pinCode = useWatch({ control, name: 'pin' });

  useEffect(() => {
    if (pinCode && pinCode.length === 6) {
      fetchPinCodeDetails(pinCode).then((data) => {
        if (data) {
          setValue('city', data.city);
          setValue('district', data.district);
          setValue('state', data.state);
          toast.success('Location details fetched from PIN code.');
        }
      });
    }
  }, [pinCode, fetchPinCodeDetails, setValue]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const newCustomer = await createCustomer.mutateAsync(data);
      toast.success('Customer added successfully');
      reset();
      if (onSuccess) onSuccess(newCustomer);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
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
            <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          Add New Customer
        </div>
      }
      maxWidth="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Customer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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
              Contact Number 1
            </label>
            <Input 
              {...register('phone')} 
              placeholder="E.g., +91 9876543210" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Number 2
            </label>
            <Input 
              {...register('contact_2')} 
              placeholder="Alternate Number" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              PIN Code {isPinLoading && <span className="text-xs text-primary-500 ml-2">(Fetching...)</span>}
            </label>
            <Input 
              {...register('pin')} 
              placeholder="E.g., 110001" 
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Village / Town
            </label>
            <Input 
              {...register('village')} 
              placeholder="Village or Town" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              City
            </label>
            <Input 
              {...register('city')} 
              placeholder="City" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              District
            </label>
            <Input 
              {...register('district')} 
              placeholder="District" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              State
            </label>
            <Input 
              {...register('state')} 
              placeholder="State" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Address / Landmark (Optional)
            </label>
            <Textarea 
              {...register('address')} 
              placeholder="Street Address or Landmark"
              rows={2}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
