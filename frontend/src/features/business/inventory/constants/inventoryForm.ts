import type { ReactNode } from 'react';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const getInventoryFormConfig = (
  categories: { value: string | number; label: string }[],
  brands: { value: string | number; label: string }[],
  isEditing?: boolean
): FormSectionConfig[] => [
  {
    title: 'Basic Info',
    description: 'Provide general product details and classification.',
    fields: [
      {
        name: 'category_id',
        label: 'Category',
        type: 'select',
        options: categories,
        required: true,
        searchable: true,
        creatable: true,
        tooltip: 'The product category this item belongs to. Type to search or create a new one.',
      },
      {
        name: 'brand_id',
        label: 'Brand (Optional)',
        type: 'select',
        options: brands,
        searchable: true,
        creatable: true,
        placeholder: 'e.g. Samsung, Apple, OnePlus...',
        tooltip: 'The manufacturer or brand name of the product. Type to search or create a new one.',
      },
      {
        name: 'model_name',
        label: 'Product / Model Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Galaxy S23, Charger 20W...',
        tooltip: 'The specific product name or model name.',
      },
      {
        name: 'variant',
        label: 'Variant (Optional)',
        type: 'text',
        placeholder: 'e.g. 8GB/128GB Black',
        tooltip: 'Specify RAM, storage, color, or other variations.',
      },
    ],
  },
  {
    title: isEditing ? 'Pricing' : 'Pricing & Stock',
    description: isEditing ? 'Update your product pricing.' : 'Set your purchase cost, selling price, and initial stock.',
    fields: [
      {
        name: 'purchase_price',
        label: 'Purchase Price (₹)',
        type: 'number',
        required: true,
        step: '0.01',
        tooltip: 'Your cost price for this item. Used for profit calculation.',
      },
      {
        name: 'mrp',
        label: 'MRP (₹)',
        type: 'number',
        required: true,
        step: '0.01',
        tooltip: 'Maximum Retail Price. This will be the default selling price.',
      },
      ...(isEditing ? [] : [
        {
          name: 'quantity',
          label: 'Initial Stock',
          type: 'number' as const,
          required: true,
          step: '1',
          tooltip: 'The initial number of units available in your inventory.',
        }
      ]),
    ],
  },
];
