import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const supplierFormConfig: FormSectionConfig[] = [
  {
    title: 'Supplier Details',
    description: 'Basic contact and business info for the supplier.',
    fields: [
      {
        name: 'name',
        label: 'Supplier Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Samsung Distributors',
        colSpan: 2,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: 'e.g. +91 9876543210',
      },
      {
        name: 'items_supplied',
        label: 'Items Supplied',
        type: 'text',
        placeholder: 'e.g. Mobile Phones, Chargers',
      },
      {
        name: 'address',
        label: 'Address',
        type: 'textarea',
        placeholder: 'Complete address of the supplier',
        colSpan: 2,
      },
    ],
  },
];
