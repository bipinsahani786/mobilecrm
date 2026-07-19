import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { usePlans } from '../../plans/api/usePlans';
import { usePartners } from '../../partners/api/usePartners';
import { PREMIUM_FEATURES } from '../../plans/components/PlanFormModal';
import { onboardSchema, type OnboardFormValues } from '../schemas/tenantSchema';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { getOnboardFormConfig } from '../constants/tenantOnboardForm';

interface OnboardTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardTenantModal({ isOpen, onClose }: OnboardTenantModalProps) {
  const queryClient = useQueryClient();
  const { data: plansData } = usePlans({ all: true });
  const plans = plansData?.data;
  const { data: partnersData } = usePartners({ all: true });
  const partners = partnersData?.data;
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(onboardSchema),
    defaultValues: {
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      owner_password: '',
      business_name: '',
      plan_id: undefined as number | undefined,
      partner_id: undefined as number | null | undefined,
    }
  });

  const { reset, watch } = form;
  const selectedPlanId = watch('plan_id');
  const selectedPlan = plans?.find(p => p.id === Number(selectedPlanId));

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedFeatures({});
    }
  }, [isOpen, reset]);

  const toggleCustomFeature = (featureId: string, value: boolean) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureId]: value
    }));
  };

  const onSubmit: SubmitHandler<OnboardFormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        custom_features: Object.keys(selectedFeatures).length > 0 ? selectedFeatures : null
      };

      await api.post('/superadmin/businesses/onboard', payload);
      toast.success('Tenant onboarded successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'businesses'] });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to onboard tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Onboard New Tenant"
      maxWidth="3xl"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="onboard-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white px-6">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Onboard Tenant
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="onboard-form"
        form={form}
        onSubmit={onSubmit}
        sections={getOnboardFormConfig(plans, partners, () => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {PREMIUM_FEATURES.map((feature: any) => {
              const isPlanFeature = !!selectedPlan?.features?.[feature.id];
              const overrideVal = selectedFeatures[feature.id];
              
              return (
                <div key={feature.id} className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{feature.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                    </div>
                    {isPlanFeature && (
                      <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">In Plan</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => toggleCustomFeature(feature.id, true)}
                      className={`flex-1 py-1 text-xs font-semibold rounded ${overrideVal === true ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/20'}`}
                    >
                      Force ON
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCustomFeature(feature.id, false)}
                      className={`flex-1 py-1 text-xs font-semibold rounded ${overrideVal === false ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/20'}`}
                    >
                      Force OFF
                    </button>
                    {overrideVal !== undefined && (
                      <button
                        type="button"
                        onClick={() => {
                          const newObj = { ...selectedFeatures };
                          delete newObj[feature.id];
                          setSelectedFeatures(newObj);
                        }}
                        className="px-2 py-1 text-xs font-semibold rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      />
    </Modal>
  );
}
