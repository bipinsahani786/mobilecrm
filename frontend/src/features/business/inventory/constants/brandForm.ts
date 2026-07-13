import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const brandFormConfig: FormSectionConfig[] = [
  {
    title: 'Brand Details',
    description: 'Provide a descriptive name to organize your products efficiently.',
    fields: [
      {
        name: 'name',
        label: 'Brand Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Samsung, Apple, Motorola',
        tooltip: 'Enter the official brand or manufacturer name.',
        colSpan: 2,
      }
    ],
  },
];
