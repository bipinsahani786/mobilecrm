import type { FormSectionConfig } from '@/components/ui/dynamic-form';
import type { Partner } from '../../partners/api/usePartners';

export const getTenantProfileFormConfig = (
  partners: Partner[] | undefined
): FormSectionConfig[] => [
  {
    fields: [
      {
        name: 'name',
        label: 'Business Name',
        type: 'text',
        required: true,
        placeholder: 'Business name',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Email address',
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'text',
        placeholder: 'Phone number',
      },
      {
        name: 'gst_number',
        label: 'GST Number',
        type: 'text',
        placeholder: 'GST Number',
      },
      {
        name: 'partner_id',
        label: 'Assign Partner',
        type: 'select',
        tooltip: 'Link this tenant to a partner for commission calculation',
        placeholder: 'No Partner (Direct Sale)',
        options: partners?.map((partner) => ({
          value: String(partner.id),
          label: `${partner.name} - ${partner.referral_code}`,
        })) || [],
      },
      {
        name: 'status',
        label: 'Tenant Status',
        type: 'select',
        required: true,
        options: [
          { value: 'active', label: 'Active' },
          { value: 'suspended', label: 'Suspended' },
        ],
      },
    ],
  },
];
