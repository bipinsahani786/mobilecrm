import type { FormSectionConfig } from '@/components/ui/dynamic-form';
import type { Partner } from '../../partners/api/usePartners';

export const getLeadFormConfig = (partners?: Partner[]): FormSectionConfig[] => [
  {
    fields: [
      {
        name: 'partner_id',
        label: 'Partner / Sales Agent',
        type: 'select',
        required: true,
        searchable: true,
        tooltip: "Select the sales agent who referred this lead. Their commission will be calculated based on partner settings.",
        placeholder: "Select a partner",
        options: partners?.map(p => ({
          value: p.id,
          label: `${p.name} ${p.company_name ? `(${p.company_name})` : ''}`
        })) || []
      },
      {
        name: 'status',
        label: 'Lead Status',
        type: 'select',
        required: true,
        tooltip: "New: Just added. Contacted: Follow-up done. Converted: Became a paying customer. Lost: Not interested.",
        options: [
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'converted', label: 'Converted' },
          { value: 'lost', label: 'Lost' },
        ]
      },
      {
        name: 'business_name',
        label: 'Business Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
        tooltip: "The name of the potential customer's business.",
      },
      {
        name: 'contact_person',
        label: 'Contact Person',
        type: 'text',
        required: true,
        placeholder: 'John Doe',
        tooltip: "The person's name to contact at this business.",
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'text',
        placeholder: '+91 9876543210',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'contact@example.com',
      },
      {
        name: 'notes',
        label: 'Notes (Optional)',
        type: 'textarea',
        colSpan: 2,
        placeholder: 'Any additional notes about this lead...',
        tooltip: "Any important context about this lead — source, interest level, past interactions, etc.",
      }
    ]
  }
];
