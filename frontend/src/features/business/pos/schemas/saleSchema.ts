import { z } from 'zod';

// --- Interfaces ---
export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_batch_id?: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: any;
  batch?: any;
}

export interface SalePayment {
  id: number;
  sale_id: number;
  payment_mode: string;
  amount: number;
  notes?: string;
}

export interface Sale {
  id: number;
  business_id: number;
  customer_id?: number;
  user_id: number;
  invoice_number: string;
  total_amount: number;
  discount: number;
  round_off: number;
  final_amount: number;
  paid_amount: number;
  payment_mode?: string;
  status: string;
  date: string;
  notes?: string;
  created_at: string;
  customer?: any; // Will use Customer from customers/schemas in full implementation
  items?: SaleItem[];
  payments?: SalePayment[];
  emiDetail?: any;
  emi_detail?: any;
  draft_data?: any;
}

export interface CartItem {
  id: string; // unique cart item id
  product_id: number;
  batch_id?: number;
  model_name: string;
  batch_number?: string;
  unit_price: number;
  quantity: number;
  max_quantity: number;
  category_name?: string;
}

// --- Zod Schemas ---
export const checkoutSchema = z.object({
  customer_id: z.number().optional().nullable(),
  discount: z.number().min(0).default(0),
  round_off: z.number().default(0),
  notes: z.string().optional().nullable(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
