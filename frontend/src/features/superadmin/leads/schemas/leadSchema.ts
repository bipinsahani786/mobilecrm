import { z } from 'zod';

export const leadSchema = z.object({
  partner_id: z.coerce.number().min(1, 'Partner is required'),
  business_name: z.string().min(2, 'Business name is required'),
  contact_person: z.string().min(2, 'Contact person is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  status: z.enum(['new', 'contacted', 'converted', 'lost']),
  notes: z.string().optional().nullable(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const logSchema = z.object({
  contacted_by:    z.string().optional(),
  contacted_at:    z.string().min(1, 'Date & time required'),
  outcome:         z.enum(['called', 'emailed', 'whatsapp', 'visited', 'no_answer']),
  notes:           z.string().optional(),
  next_contact_at: z.string().optional(),
});

export type LogFormValues = z.infer<typeof logSchema>;

