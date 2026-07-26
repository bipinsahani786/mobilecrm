import { z } from 'zod';

// --- Interfaces ---

export interface Customer {
  id: number;
  business_id: number;
  name: string;
  phone?: string | null;
  contact_2?: string | null;
  address?: string | null;
  village?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pin?: string | null;
  sales_sum_final_amount?: number;
  sales_sum_paid_amount?: number;
  sales?: any[];
  created_at: string;
}

// --- Zod Schemas ---

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().optional().nullable().or(z.literal('')),
  contact_2: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  village: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  district: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  pin: z.string().optional().nullable().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
