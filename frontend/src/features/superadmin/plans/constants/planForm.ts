import type { ReactNode } from 'react';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const getPlanFormConfig = (
  renderFeaturesSection: () => ReactNode
): FormSectionConfig[] => [
  {
    fields: [
      {
        name: 'name',
        label: 'Plan Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Pro Plan',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        tooltip: 'A short description visible to tenants',
        placeholder: 'Brief description...',
      },
      {
        name: 'price_monthly',
        label: 'Monthly Price (₹)',
        type: 'number',
        required: true,
        step: '0.01',
        placeholder: '0.00',
      },
      {
        name: 'price_yearly',
        label: 'Yearly Price (₹)',
        type: 'number',
        required: true,
        step: '0.01',
        tooltip: 'Discounted yearly price',
        placeholder: '0.00',
      },
      {
        name: 'features_section',
        label: 'Features Included',
        type: 'custom',
        colSpan: 2,
        render: renderFeaturesSection,
      },
    ],
  },
];
