import { z } from 'zod';

// --- Zod Schemas ---

export const returnItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  product_batch_id: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.coerce.number().min(0, 'Price cannot be negative'),
});

export const purchaseReturnSchema = z.object({
  return_date: z.string().min(1, 'Return date is required'),
  supplier_purchase_id: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(returnItemSchema).min(1, 'At least one item is required'),
});

export type PurchaseReturnFormValues = z.infer<typeof purchaseReturnSchema>;
