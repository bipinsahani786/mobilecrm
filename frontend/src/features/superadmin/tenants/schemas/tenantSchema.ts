import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  partner_id: z.string().optional().nullable(),
  status: z.enum(['active', 'suspended']),
});

export const passwordSchema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const onboardSchema = z.object({
  owner_name: z.string().min(2, 'Name is required'),
  owner_email: z.string().email('Invalid email'),
  owner_phone: z.string().optional(),
  owner_password: z.string().min(8, 'Password must be at least 8 characters'),
  business_name: z.string().min(2, 'Business name is required'),
  plan_id: z.coerce.number().optional(),
  partner_id: z.coerce.number().optional().nullable(),
});

export type OnboardFormValues = z.infer<typeof onboardSchema>;
