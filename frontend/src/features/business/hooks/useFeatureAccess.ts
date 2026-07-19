import { useTenantStore } from '@/store/tenantStore';

export type FeatureKey = 'has_finance' | 'has_payroll' | 'can_whitelabel_invoice' | 'has_activity_logs';

export function useFeatureAccess() {
  const { activeBusiness } = useTenantStore();
  
  // If there's no business or plan, we can decide the default fallback.
  // Assuming a generic default fallback where premium features are false.
  const features: Record<string, any> = activeBusiness?.plan?.features || {};

  const hasFeature = (key: FeatureKey) => {
    return !!features[key];
  };

  const getMaxLimit = (key: 'max_locations' | 'max_staff') => {
    return (features[key] as number) || 1;
  };

  return {
    hasFeature,
    getMaxLimit,
    features,
    planName: activeBusiness?.plan?.name || 'Free Plan'
  };
}
