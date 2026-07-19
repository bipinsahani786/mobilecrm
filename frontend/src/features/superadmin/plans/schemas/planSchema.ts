import { z } from 'zod';

export const planSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().nullable(),
  price_monthly: z.coerce.number().min(0, 'Must be a positive number'),
  price_yearly: z.coerce.number().min(0, 'Must be a positive number'),
  features: z.object({
    max_locations: z.coerce.number().min(1).default(1),
    max_staff: z.coerce.number().min(1).default(1),
    has_finance: z.boolean().default(false),
    has_payroll: z.boolean().default(false),
    can_whitelabel_invoice: z.boolean().default(false),
    has_activity_logs: z.boolean().default(false),
    attendance_photo_retention_days: z.coerce.number().min(0).default(0),
  }).default({
    max_locations: 1,
    max_staff: 1,
    has_finance: false,
    has_payroll: false,
    can_whitelabel_invoice: false,
    has_activity_logs: false,
    attendance_photo_retention_days: 0,
  }),
  is_active: z.boolean()
});

export type PlanFormSchemaType = z.infer<typeof planSchema>;
