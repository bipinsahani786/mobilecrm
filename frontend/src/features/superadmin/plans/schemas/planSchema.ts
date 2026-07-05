import { z } from 'zod';

export const planSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().nullable(),
  price_monthly: z.coerce.number().min(0, 'Must be a positive number'),
  price_yearly: z.coerce.number().min(0, 'Must be a positive number'),
  features: z.array(z.string()).nullable(),
  is_active: z.boolean()
});

export type PlanFormSchemaType = z.infer<typeof planSchema>;
