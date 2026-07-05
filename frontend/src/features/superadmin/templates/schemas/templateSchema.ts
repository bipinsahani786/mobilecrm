import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['email', 'whatsapp', 'sms']),
  subject: z.string().optional(),
  body: z.string().min(1, 'Message body is required'),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
