import { z } from 'zod';

// We don't validate file in zod because it's handled as a File object in state,
// but we can validate the text fields.
export const resourceSchema = z.object({
  title: z.string().optional(),
  description: z.any().optional(),
  is_active: z.any().optional(),
});

export type ResourceFormValues = z.infer<typeof resourceSchema>;
