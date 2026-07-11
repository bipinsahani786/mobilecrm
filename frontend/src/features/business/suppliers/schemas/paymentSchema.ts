import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  supplier_purchase_id: z.number().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
