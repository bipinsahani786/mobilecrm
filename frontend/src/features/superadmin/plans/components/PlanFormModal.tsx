import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planSchema } from '../schemas/planSchema';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreatePlan, useUpdatePlan } from '../api/usePlans';
import type { Plan, PlanFormValues } from '../api/usePlans';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { getPlanFormConfig } from '../constants/planForm';

export const PREMIUM_FEATURES = [
  { id: 'has_finance', label: 'EMI & Finance', description: 'Enable EMI tracking and finance ledgers.' },
  { id: 'has_payroll', label: 'HR & Payroll', description: 'Enable staff attendance, advance salary, and commission tracking.' },
  { id: 'can_whitelabel_invoice', label: 'Invoice Customization', description: 'Allow custom letterheads and remove CRM watermark.' },
  { id: 'has_activity_logs', label: 'Activity Logs', description: 'Detailed audit logs for staff actions.' },
];



interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: Plan | null;
}

export function PlanFormModal({ isOpen, onClose, planToEdit }: PlanFormModalProps) {

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      features: {
        max_locations: 1,
        max_staff: 1,
        has_finance: false,
        has_payroll: false,
        can_whitelabel_invoice: false,
        has_activity_logs: false,
        attendance_photo_retention_days: 0,
      },
      is_active: true
    }
  });

  const { reset, formState: { isSubmitting } } = form;

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();

  useEffect(() => {
    if (planToEdit) {
      reset({
        name: planToEdit.name,
        description: planToEdit.description || '',
        price_monthly: planToEdit.price_monthly,
        price_yearly: planToEdit.price_yearly,
        is_active: planToEdit.is_active,
        features: {
          max_locations: planToEdit.features?.max_locations || 1,
          max_staff: planToEdit.features?.max_staff || 1,
          has_finance: !!planToEdit.features?.has_finance,
          has_payroll: !!planToEdit.features?.has_payroll,
          can_whitelabel_invoice: !!planToEdit.features?.can_whitelabel_invoice,
          has_activity_logs: !!planToEdit.features?.has_activity_logs,
          attendance_photo_retention_days: planToEdit.features?.attendance_photo_retention_days || 0,
        }
      });
    } else {
      reset({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        features: {
          max_locations: 1,
          max_staff: 1,
          has_finance: false,
          has_payroll: false,
          can_whitelabel_invoice: false,
          has_activity_logs: false,
          attendance_photo_retention_days: 0,
        },
        is_active: true
      });
    }
  }, [planToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<PlanFormValues> = async (data) => {
    try {
      if (planToEdit) {
        await updateMutation.mutateAsync({ id: planToEdit.id, data });
        toast.success('Plan updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Plan created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={planToEdit ? 'Edit Plan' : 'Create New Plan'}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="plan-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {planToEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="plan-form"
        form={form}
        onSubmit={onSubmit}
        sections={getPlanFormConfig(() => (
          <div className="space-y-6 w-full pt-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 border-b pb-2">Usage Limits</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Max Branches/Locations</label>
                <input 
                  type="number" 
                  className="w-full h-10 px-3 rounded-lg border bg-slate-50 dark:bg-black/20" 
                  {...form.register('features.max_locations', { valueAsNumber: true })} 
                  min={1} 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Max Staff Users</label>
                <input 
                  type="number" 
                  className="w-full h-10 px-3 rounded-lg border bg-slate-50 dark:bg-black/20" 
                  {...form.register('features.max_staff', { valueAsNumber: true })} 
                  min={1} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium mb-1">Attendance Photo Retention (Days)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    className="w-full h-10 px-3 rounded-lg border bg-slate-50 dark:bg-black/20" 
                    {...form.register('features.attendance_photo_retention_days', { valueAsNumber: true })} 
                    min={0}
                    placeholder="0 = No Retention"
                  />
                  <span className="text-[10px] text-slate-500 w-full">Set 0 to disable storage. (e.g. 60 or 180 days)</span>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 border-b pb-2 mt-6">Premium Modules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREMIUM_FEATURES.map(feature => {
                const isSelected = form.watch(`features.${feature.id}` as any);
                return (
                  <div 
                    key={feature.id} 
                    onClick={() => form.setValue(`features.${feature.id}` as any, !isSelected, { shouldDirty: true })}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary-500/10 border-primary-500/50' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary-500 border-primary-500' : 'border-slate-400 dark:border-slate-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {feature.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      />
    </Modal>
  );
}
