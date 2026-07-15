import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0, 'Amount must be valid'),
  payment_mode: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Debit Card', 'Credit Card', 'Split Payment']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  supplier_purchase_id: z.number().optional(),
  split_cash: z.coerce.number().optional().default(0),
  split_upi: z.coerce.number().optional().default(0),
  split_debit_card: z.coerce.number().optional().default(0),
  split_credit_card: z.coerce.number().optional().default(0),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
