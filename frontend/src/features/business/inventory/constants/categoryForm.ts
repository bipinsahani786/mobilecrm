import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const getCategoryFormConfig = (): FormSectionConfig[] => [
  {
    title: 'Category Details',
    description: 'Provide a descriptive name to organize your products efficiently.',
    fields: [
      {
        name: 'name',
        label: 'Category Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Smartphones, Accessories, Audio...',
        tooltip: 'Enter the descriptive name of the category (e.g. Smartphones, Accessories).',
        colSpan: 2,
      }
    ],
  },
];
