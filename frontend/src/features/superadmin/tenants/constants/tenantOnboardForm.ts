import type { ReactNode } from 'react';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';
import type { Plan } from '../../plans/api/usePlans';
import type { Partner } from '../../partners/api/usePartners';

export const getOnboardFormConfig = (
  plans: Plan[] | undefined,
  partners: Partner[] | undefined,
  renderOverridesSection: () => ReactNode
): FormSectionConfig[] => [
  {
    title: '1. Owner Details',
    fields: [
      {
        name: 'owner_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'John Doe',
      },
      {
        name: 'owner_email',
        label: 'Email Address',
        type: 'email',
        required: true,
        tooltip: 'Used for login and notifications',
        placeholder: 'john@example.com',
      },
      {
        name: 'owner_phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: '+91 9876543210',
      },
      {
        name: 'owner_password',
        label: 'Password',
        type: 'text',
        required: true,
        tooltip: 'Temporary password for the owner to log in',
        placeholder: 'Minimum 8 characters',
      },
    ],
  },
  {
    title: '2. Business Details',
    fields: [
      {
        name: 'business_name',
        label: 'Business Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        name: 'plan_id',
        label: 'Assign Plan',
        type: 'select',
        tooltip: 'Select a subscription plan to dictate feature access',
        placeholder: 'No Plan (Free/Manual)',
        options: plans?.map((plan) => ({
          value: plan.id,
          label: `${plan.name} (₹${plan.price_monthly}/mo)`,
        })) || [],
      },
      {
        name: 'partner_id',
        label: 'Assign Partner / Sales Agent',
        type: 'select',
        tooltip: 'Link this tenant to a partner for commission calculation',
        placeholder: 'No Partner (Direct Sale)',
        options: partners?.map((partner) => ({
          value: partner.id,
          label: `${partner.name} - ${partner.referral_code}`,
        })) || [],
      },
    ],
  },
  {
    title: '3. Custom Feature Overrides (Optional)',
    description: 'Use this to explicitly grant or deny features to this tenant, overriding what their plan allows. Leave unchanged to use Plan defaults.',
    fields: [
      {
        name: 'overrides_section',
        label: 'Feature Overrides',
        type: 'custom',
        colSpan: 2,
        render: renderOverridesSection,
      },
    ],
  },
];
