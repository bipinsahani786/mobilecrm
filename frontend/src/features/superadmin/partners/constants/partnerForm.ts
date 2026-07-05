import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const getPartnerFormConfig = (commissionType: string): FormSectionConfig[] => [
  {
    title: '1. Profile Details',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        tooltip: "Full name of the sales agent or affiliate partner.",
        placeholder: 'John Doe',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        tooltip: "Partner's login email. Must be unique. Used for communication and future portal access.",
        placeholder: 'john@example.com',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        tooltip: "Optional. Used for direct contact with the partner.",
        placeholder: '+91 9876543210',
      },
      {
        name: 'company_name',
        label: 'Company Name (Optional)',
        type: 'text',
        tooltip: "If the partner operates under a company, enter the company name here.",
        placeholder: 'Acme Agencies',
      },
      {
        name: 'password',
        label: 'Password (Optional)',
        type: 'password',
        tooltip: "Leave blank to auto-generate or keep existing password. Min 8 characters.",
        placeholder: '••••••••',
      }
    ]
  },
  {
    title: '2. Commission Rules',
    fields: [
      {
        name: 'commission_type',
        label: 'Commission Type',
        type: 'select',
        tooltip: "Percentage: calculated as % of the plan price. Fixed: a flat rupee amount per sale.",
        options: [
          { value: 'percentage', label: 'Percentage (%)' },
          { value: 'fixed', label: 'Fixed Amount (₹)' },
        ]
      },
      {
        name: 'commission_value',
        label: `Commission Value ${commissionType === 'percentage' ? '(%)' : '(₹)'}`,
        type: 'number',
        step: '0.01',
        tooltip: commissionType === 'percentage' ? 'Enter a value between 0-100. E.g. 10 means 10% of plan price.' : 'Enter a fixed rupee amount. E.g. 500 means ₹500 per sale.',
      },
      {
        name: 'is_recurring_commission',
        label: 'Recurring Commission',
        type: 'checkbox',
        colSpan: 2,
        description: "If enabled, partner receives commission every time the tenant renews their plan. Otherwise, only on the first sale.",
      }
    ]
  },
  {
    title: '3. White-labeling & Status',
    fields: [
      {
        name: 'custom_domain',
        label: 'Custom Domain (Optional)',
        type: 'text',
        placeholder: 'partner.mobilecrm.com',
        description: "Will be used for white-labeled tenant portals in the future.",
      },
      {
        name: 'status',
        label: 'Active Partner',
        type: 'checkbox',
      }
    ]
  }
];
