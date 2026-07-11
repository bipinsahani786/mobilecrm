import React from 'react';
import { useFeature } from '@/hooks/useFeature';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback = null }: FeatureGuardProps) {
  const { hasFeature } = useFeature();

  if (!hasFeature(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
