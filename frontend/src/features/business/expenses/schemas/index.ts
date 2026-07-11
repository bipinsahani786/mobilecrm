import * as z from 'zod';

export const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number({ message: 'Amount must be a positive number' }).min(0, 'Amount must be a positive number'),
  expense_date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  receipt: z.any().optional(), // Handled specially for file uploads
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export interface Expense {
  id: number;
  business_id: number;
  category: string;
  amount: string | number;
  description: string | null;
  receipt_path: string | null;
  added_by: number;
  added_by_name?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}
