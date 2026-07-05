import { useEffect, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useGetActivePlans, useOnboardClient } from '../api/usePartnerClients';
import { onboardSchema, type OnboardFormValues } from '../schemas/onboardClientSchema';
import { defaultOnboardFormValues } from '../constants/onboardClientForm';

interface OnboardClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardClientModal({ isOpen, onClose }: OnboardClientModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { data: plansData, isLoading: isLoadingPlans } = useGetActivePlans();
  const onboardMutation = useOnboardClient();
  const plans = plansData?.data || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnboardFormValues>({
    resolver: zodResolver(onboardSchema),
    defaultValues: defaultOnboardFormValues as any,
  });

  const paymentMethod = watch('payment_method');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setShowPassword(false);
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<OnboardFormValues> = async (data) => {
    try {
      await onboardMutation.mutateAsync({
        ...data,
        plan_id: data.plan_id ? parseInt(data.plan_id, 10) : undefined,
        amount_paid: data.amount_paid ? parseFloat(data.amount_paid) : undefined,
      } as any);
      toast.success('Client onboarded successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to onboard client');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Onboard New Client">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Business Details */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Business Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Business Name *</label>
              <Input
                {...register('business_name')}
                placeholder="e.g. Acme Corp"
                error={errors.business_name?.message}
                className="bg-slate-50 dark:bg-white/5"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Select Plan</label>
              {isLoadingPlans ? (
                <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-md animate-pulse"></div>
              ) : (
                <select
                  {...register('plan_id')}
                  className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-200">No Plan (Trial)</option>
                  {plans.map((plan: any) => (
                    <option key={plan.id} value={plan.id} className="bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
                      {plan.name} - ₹{plan.price_monthly}/mo or ₹{plan.price_yearly}/yr
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/10 pt-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Owner Details</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Owner Name *</label>
                <Input
                  {...register('owner_name')}
                  placeholder="John Doe"
                  error={errors.owner_name?.message}
                  className="bg-slate-50 dark:bg-white/5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Owner Email *</label>
                <Input
                  {...register('owner_email')}
                  type="email"
                  placeholder="john@acme.com"
                  error={errors.owner_email?.message}
                  className="bg-slate-50 dark:bg-white/5"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Temporary Password *</label>
              <div className="relative">
                <Input
                  {...register('owner_password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  error={errors.owner_password?.message}
                  className="bg-slate-50 dark:bg-white/5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Client can change this after logging in.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/10 pt-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Payment Handling</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`relative flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                <input
                  type="radio"
                  value="online"
                  {...register('payment_method')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'online' ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Client will pay online</div>
                  <div className="text-xs text-slate-500 mt-0.5">They will pay via portal later</div>
                </div>
              </label>

              <label className={`relative flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'offline' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                <input
                  type="radio"
                  value="offline"
                  {...register('payment_method')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'offline' ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {paymentMethod === 'offline' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Collected offline</div>
                  <div className="text-xs text-slate-500 mt-0.5">I collected cash/UPI directly</div>
                </div>
              </label>
            </div>

            {paymentMethod === 'offline' && (
              <div className="p-4 bg-slate-100 dark:bg-[#111115] rounded-xl border border-slate-200 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Amount Collected (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input
                    {...register('amount_paid')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.amount_paid?.message}
                    className="pl-8 bg-white dark:bg-[#09090b]"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  System will record this amount and calculate your commission based on it.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting || onboardMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting || onboardMutation.isPending} className="bg-primary-500 hover:bg-primary-600 text-white">
            {(isSubmitting || onboardMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create & Onboard Client
          </Button>
        </div>
      </form>
    </Modal>
  );
}
