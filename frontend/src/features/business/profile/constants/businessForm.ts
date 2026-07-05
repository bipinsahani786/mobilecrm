import type { ReactNode } from 'react';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const getBusinessProfileFormConfig = (
  renderBrandingSection: () => ReactNode
): FormSectionConfig[] => [
  {
    title: 'Business Identity',
    fields: [
      {
        name: 'name',
        label: 'Business Name',
        type: 'text',
        required: true,
        tooltip: 'Enter your legally registered business name. This will appear on all official documents.',
        placeholder: 'E.g. Acme Corp',
      },
      {
        name: 'gst_number',
        label: 'GSTIN',
        type: 'text',
        tooltip: '15-digit Goods and Services Tax Identification Number. Leave blank if not applicable.',
        placeholder: 'GST Number',
      },
      {
        name: 'description',
        label: 'Tagline / Description',
        type: 'text',
        colSpan: 2,
        tooltip: 'A short description or slogan for your business to show on your profile.',
        placeholder: 'A short description of your business',
      },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        tooltip: 'Official email address for communication and customer inquiries.',
        placeholder: 'contact@business.com',
      },
      {
        name: 'phone',
        label: 'Primary Phone',
        type: 'text',
        tooltip: 'Main contact number for your business.',
        placeholder: '+91 98765 43210',
      },
      {
        name: 'phone_2',
        label: 'Secondary Phone',
        type: 'text',
        tooltip: 'Alternate contact number (optional).',
        placeholder: '+91 87654 32109',
      },
    ],
  },
  {
    title: 'Address & Location',
    fields: [
      {
        name: 'address',
        label: 'Complete Address',
        type: 'text',
        colSpan: 2,
        tooltip: 'Building name, street, and locality of your primary business location.',
        placeholder: '123 Business Park, Block A',
      },
      {
        name: 'state',
        label: 'State',
        type: 'text',
        tooltip: 'State or Province of your business.',
        placeholder: 'Maharashtra',
      },
      {
        name: 'pincode',
        label: 'Pincode',
        type: 'text',
        tooltip: 'Postal or ZIP Code of your area.',
        placeholder: '400001',
      },
    ],
  },
  {
    title: 'Branding Assets',
    fields: [
      {
        name: 'branding_assets',
        label: 'Branding Assets',
        type: 'custom',
        colSpan: 2,
        render: renderBrandingSection,
      },
    ],
  },
];
