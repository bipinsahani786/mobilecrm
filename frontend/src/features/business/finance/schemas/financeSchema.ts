import { z } from 'zod';
import type { Sale } from '../../pos/schemas/saleSchema';

// --- Interfaces ---
export interface EmiDetail {
  id: number;
  sale_id: number;
  financier_name: string;
  down_payment: number;
  loan_amount: number;
  processing_fee: number;
  tenure_months?: number;
  is_payout_received: boolean;
  payout_date?: string;
  sale?: Sale;
  created_at: string;
}

// --- Zod Schemas ---
export const emiDetailSchema = z.object({
  financier_name: z.string().min(1, 'Financier name is required'),
  down_payment: z.number().min(0).default(0),
  loan_amount: z.number().min(0, 'Loan amount is required'),
  processing_fee: z.number().min(0).default(0),
  tenure_months: z.number().min(1).optional(),
});

export type EmiDetailFormValues = z.infer<typeof emiDetailSchema>;
