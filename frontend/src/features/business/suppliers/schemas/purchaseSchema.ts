import { z } from 'zod';

export const purchaseItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  purchase_price: z.coerce.number().min(0, 'Price cannot be negative'),
  mrp: z.coerce.number().min(0, 'MRP cannot be negative').optional(),
  batch_number: z.string().optional(),
});

export const purchaseSchema = z.object({
  bill_amount: z.coerce.number().min(0, 'Bill amount must be positive'),
  paid_amount: z.coerce.number().min(0).default(0),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  due_date: z.string().optional().or(z.literal('')),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  // Note: invoice_file is handled separately since it's a File object
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
