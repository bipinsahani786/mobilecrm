import * as z from 'zod';

export const settingsSchema = z.object({
  app_name: z.string().min(2, 'App name must be at least 2 characters'),
  partner_commission_type: z.enum(['percentage', 'fixed']),
  partner_commission_value: z.coerce.number().min(0, 'Commission must be positive'),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
