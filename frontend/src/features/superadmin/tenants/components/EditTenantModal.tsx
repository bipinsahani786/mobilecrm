import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, passwordSchema, type ProfileFormValues, type PasswordFormValues } from '../schemas/tenantSchema';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { usePlans } from '../../plans/api/usePlans';
import { usePartners } from '../../partners/api/usePartners';
import { useUpdateTenant, useResetTenantPassword } from '../api/useSuperadminTenants';
import { PREMIUM_FEATURES } from '../../plans/components/PlanFormModal';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { getTenantProfileFormConfig } from '../constants/tenantProfileForm';
import { tenantSecurityFormConfig } from '../constants/tenantSecurityForm';



interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any | null;
}

export function EditTenantModal({ isOpen, onClose, tenant }: EditTenantModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'plan' | 'security'>('profile');
  const { data: plansData } = usePlans({ all: true });
  const plans = plansData?.data;
  const { data: partnersData } = usePartners({ all: true });
  const partners = partnersData?.data;
  const updateTenant = useUpdateTenant();
  const resetPassword = useResetTenantPassword();

  // Plan State
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [planExpiresAt, setPlanExpiresAt] = useState<string>('');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (isOpen && tenant) {
      profileForm.reset({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        gst_number: tenant.gst_number,
        partner_id: tenant.partner_id ? String(tenant.partner_id) : '',
        status: tenant.status === 'suspended' ? 'suspended' : 'active',
      });
      passwordForm.reset({ new_password: '' });
      setSelectedPlanId(tenant.plan_id ? String(tenant.plan_id) : '');
      setSelectedFeatures(tenant.custom_features || {});
      
      // Handle Date formatting for input type="date"
      if (tenant.plan_expires_at) {
        const date = new Date(tenant.plan_expires_at);
        // format to YYYY-MM-DD
        setPlanExpiresAt(date.toISOString().split('T')[0]);
      } else {
        setPlanExpiresAt('');
      }

      setActiveTab('profile');
    }
  }, [isOpen, tenant, profileForm, passwordForm]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!tenant) return;
    try {
      await updateTenant.mutateAsync({ id: tenant.id, data });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!tenant) return;
    try {
      await resetPassword.mutateAsync({ id: tenant.id, new_password: data.new_password });
      toast.success('Owner password reset successfully');
      passwordForm.reset({ new_password: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const savePlanChanges = async () => {
    if (!tenant) return;
    try {
      const payload = {
        plan_id: selectedPlanId ? Number(selectedPlanId) : null,
        custom_features: Object.keys(selectedFeatures).length > 0 ? selectedFeatures : null,
        plan_expires_at: planExpiresAt ? planExpiresAt : null,
      };
      await updateTenant.mutateAsync({ id: tenant.id, data: payload });
      toast.success('Plan & Features updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    }
  };

  const toggleCustomFeature = (featureId: string, value: boolean) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureId]: value
    }));
  };

  if (!isOpen || !tenant) return null;

  const selectedPlan = plans?.find(p => p.id === Number(selectedPlanId));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Edit Tenant: ${tenant.name}`}
      maxWidth="3xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 mb-6">
        <button
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('profile')}
        >
          Business Profile
        </button>
        <button
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'plan' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('plan')}
        >
          Plan & Features
        </button>
        <button
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="min-h-[300px]">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <DynamicForm
            id="profile-form"
            form={profileForm}
            onSubmit={onProfileSubmit}
            sections={getTenantProfileFormConfig(partners)}
            className="space-y-4"
          >
            <div className="pt-4 flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={() => setActiveTab('plan')} className="text-slate-600 dark:text-slate-300">
                Next <span className="ml-1">→</span>
              </Button>
              <Button size="sm" type="submit" disabled={profileForm.formState.isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
                {profileForm.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Profile
              </Button>
            </div>
          </DynamicForm>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Plan</label>
                  <InfoTooltip text="Change the tenant's subscription plan" />
                </div>
                <Select 
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <option value="">No Plan (Free/Manual)</option>
                  {plans?.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name} (₹{plan.price_monthly}/mo)</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plan Expires At</label>
                  <InfoTooltip text="Set the exact date when the subscription ends. Leave empty for lifetime." />
                </div>
                <Input 
                  type="date" 
                  value={planExpiresAt} 
                  onChange={(e) => setPlanExpiresAt(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-3 border-t border-slate-100 dark:border-white/5 pt-4">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom Feature Overrides</label>
                <InfoTooltip text="Grant or deny specific features regardless of the assigned plan" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PREMIUM_FEATURES.map((feature: any) => {
                  const isPlanFeature = !!selectedPlan?.features?.[feature.id];
                  const overrideVal = selectedFeatures[feature.id];
                  
                  return (
                    <div key={feature.id} className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{feature.label}</p>
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
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={() => setActiveTab('security')} className="text-slate-600 dark:text-slate-300">
                Next <span className="ml-1">→</span>
              </Button>
              <Button size="sm" type="button" onClick={savePlanChanges} disabled={updateTenant.isPending} className="bg-primary-500 hover:bg-primary-600 text-white">
                {updateTenant.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Plan & Features
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4 max-w-md">
            <div className="p-4 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-500 rounded-lg text-sm mb-4">
              <strong>Warning:</strong> This will instantly change the password for the owner account ({tenant.owner?.email}). They will be logged out of active sessions.
            </div>
            <DynamicForm
              id="password-form"
              form={passwordForm}
              onSubmit={onPasswordSubmit}
              sections={tenantSecurityFormConfig}
              className="space-y-4"
            >
              <div className="pt-4 flex justify-start">
                <Button size="sm" type="submit" disabled={passwordForm.formState.isSubmitting} variant="destructive">
                  {passwordForm.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Force Reset Password
                </Button>
              </div>
            </DynamicForm>
          </div>
        )}
      </div>
    </Modal>
  );
}
