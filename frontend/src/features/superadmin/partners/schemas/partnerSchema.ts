import { z } from 'zod';

export const partnerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  commission_type: z.enum(['percentage', 'fixed']),
  commission_value: z.coerce.number().min(0, 'Must be positive'),
  is_recurring_commission: z.boolean().default(false),
  custom_domain: z.string().optional().nullable(),
  status: z.boolean().default(true),
  password: z.string().min(8, 'Must be at least 8 characters').optional().or(z.literal('')),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;
