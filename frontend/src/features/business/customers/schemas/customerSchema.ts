import { z } from 'zod';

// --- Interfaces ---

export interface Customer {
  id: number;
  business_id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  sales_sum_final_amount?: number;
  sales_sum_paid_amount?: number;
  sales?: any[];
  created_at: string;
}

// --- Zod Schemas ---

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
