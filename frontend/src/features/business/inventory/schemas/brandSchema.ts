import { z } from 'zod';

// --- Interfaces ---
export interface Brand {
  id: number;
  business_id: number;
  name: string;
  created_at: string;
}

// --- Zod Schemas ---
export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
