import { z } from 'zod';

// --- Interfaces ---
export interface Category {
  id: number;
  business_id: number;
  name: string;
  products_count?: number;
  created_at: string;
}

// --- Zod Schemas ---
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
