import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormValues, type Customer } from '../schemas/customerSchema';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateCustomer } from '../api/useCustomers';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePinCode } from '@/hooks/usePinCode';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function EditCustomerModal({ isOpen, onClose, customer }: EditCustomerModalProps) {
  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });
  const updateCustomer = useUpdateCustomer();
  const { fetchPinCodeDetails, isLoading: isPinLoading } = usePinCode();

  const pinCode = useWatch({ control, name: 'pin' });

  useEffect(() => {
    if (pinCode && pinCode.length === 6 && (!customer?.pin || pinCode !== customer.pin)) {
      fetchPinCodeDetails(pinCode).then((data) => {
        if (data) {
          setValue('city', data.city);
          setValue('district', data.district);
          setValue('state', data.state);
          toast.success('Location details fetched from PIN code.');
        }
      });
    }
  }, [pinCode, fetchPinCodeDetails, setValue, customer?.pin]);

  useEffect(() => {
    if (customer && isOpen) {
      reset({
        name: customer.name,
        phone: customer.phone || '',
        contact_2: customer.contact_2 || '',
        address: customer.address || '',
        village: customer.village || '',
        city: customer.city || '',
        district: customer.district || '',
        state: customer.state || '',
        pin: customer.pin || '',
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
      maxWidth="xl"
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
