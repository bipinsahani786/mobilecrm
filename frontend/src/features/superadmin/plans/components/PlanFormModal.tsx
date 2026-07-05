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

export const AVAILABLE_FEATURES = [
  { id: 'inventory', label: 'Inventory Management', description: 'Manage items, stock, and low stock alerts.' },
  { id: 'suppliers', label: 'Suppliers & Purchases', description: 'Manage suppliers, purchases, and udhar (credit) balances.' },
  { id: 'parties', label: 'Customers & Ledgers', description: 'Manage customers and their payment ledgers.' },
  { id: 'pos', label: 'Point of Sale (POS)', description: 'Quick retail billing interface for sales.' },
  { id: 'emi', label: 'EMI & Finance', description: 'Track EMI payments and finance companies.' },
  { id: 'expenses', label: 'Expense Tracking', description: 'Track day-to-day shop expenses.' },
  { id: 'payroll', label: 'Attendance & Payroll', description: 'Manage employee attendance and auto-calculate payroll/incentives.' },
  { id: 'gst_billing', label: 'GST Invoicing', description: 'Enable GST calculations and GST-compliant invoice generation.' },
  { id: 'gst_reports', label: 'Advanced GST Reports', description: 'GSTR-1, GSTR-2, GSTR-3B Excel/JSON exports.' },
  { id: 'multi_branch', label: 'Multi-Branch Support', description: 'Manage multiple stores/branches under one account.' },
  { id: 'staff_roles', label: 'Staff Roles & Permissions', description: 'Invite staff with specific module access.' },
];



interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: Plan | null;
}

export function PlanFormModal({ isOpen, onClose, planToEdit }: PlanFormModalProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      features: [] as string[],
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
        features: planToEdit.features || []
      });
      setSelectedFeatures(new Set(planToEdit.features || []));
    } else {
      reset({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        features: [],
        is_active: true
      });
      setSelectedFeatures(new Set());
    }
  }, [planToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const toggleFeature = (featureId: string) => {
    const newSet = new Set(selectedFeatures);
    if (newSet.has(featureId)) {
      newSet.delete(featureId);
    } else {
      newSet.add(featureId);
    }
    setSelectedFeatures(newSet);
  };

  const onSubmit: SubmitHandler<PlanFormValues> = async (data) => {
    try {
      const payload = {
        ...data,
        features: Array.from(selectedFeatures)
      };

      if (planToEdit) {
        await updateMutation.mutateAsync({ id: planToEdit.id, data: payload });
        toast.success('Plan updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
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
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_FEATURES.map(feature => (
                <div 
                  key={feature.id} 
                  onClick={() => toggleFeature(feature.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFeatures.has(feature.id) 
                      ? 'bg-primary-500/10 border-primary-500/50' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      selectedFeatures.has(feature.id) ? 'bg-primary-500 border-primary-500' : 'border-slate-400 dark:border-slate-500'
                    }`}>
                      {selectedFeatures.has(feature.id) && <span className="text-white text-[10px] leading-none">✓</span>}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${selectedFeatures.has(feature.id) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {feature.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      />
    </Modal>
  );
}
