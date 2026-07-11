import { z } from 'zod';

// --- Interfaces ---

export interface Supplier {
  id: number;
  business_id: number;
  custom_id: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  items_supplied: string | null;
  purchases_sum_bill_amount?: number;
  purchases_sum_paid_amount?: number;
  created_at: string;
  updated_at: string;
  purchases?: any[];
  payments?: any[];
}

// --- Zod Schemas ---

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  phone: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  items_supplied: z.string().optional().nullable().or(z.literal('')),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
