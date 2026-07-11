import { useTenantStore } from '@/store/tenantStore';

export function useFeature() {
  const activeBusiness = useTenantStore((state) => state.activeBusiness);

  const hasFeature = (featureKey: string): boolean => {
    if (!activeBusiness) return false;

    // Check custom_features override first (true/false)
    const customFeatures = activeBusiness.custom_features || {};
    if (customFeatures[featureKey] !== undefined) {
      return Boolean(customFeatures[featureKey]);
    }

    // Fallback to plan features array
    const planFeatures = activeBusiness.plan?.features || [];
    if (Array.isArray(planFeatures) && planFeatures.includes(featureKey)) {
      return true;
    }

    // Default to false if not explicitly granted
    return false;
  };

  return { hasFeature };
}
