import { z } from 'zod';

export const onboardSchema = z.object({
  owner_name: z.string().min(1, 'Name is required').max(255),
  owner_email: z.string().email('Invalid email address'),
  owner_password: z.string().min(8, 'Password must be at least 8 characters'),
  business_name: z.string().min(1, 'Business name is required').max(255),
  plan_id: z.string().optional(),
  payment_method: z.enum(['online', 'offline']),
  amount_paid: z.string().optional(),
}).refine((data) => {
  if (data.payment_method === 'offline' && (!data.amount_paid || parseFloat(data.amount_paid) <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Amount collected is required for offline payments',
  path: ['amount_paid'],
});

export type OnboardFormValues = z.infer<typeof onboardSchema>;
