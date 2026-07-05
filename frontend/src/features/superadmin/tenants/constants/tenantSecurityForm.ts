import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const tenantSecurityFormConfig: FormSectionConfig[] = [
  {
    fields: [
      {
        name: 'new_password',
        label: 'New Password',
        type: 'text',
        required: true,
        placeholder: 'Min 8 characters',
      },
    ],
  },
];
