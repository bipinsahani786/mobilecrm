import { z } from 'zod';

export const productSchema = z.object({
  category_id: z.coerce.number().min(1, 'Category is required'),
  brand: z.string().optional().or(z.literal('')),
  model_name: z.string().min(1, 'Model name is required'),
  imei: z.string().optional().or(z.literal('')),
  serial_no: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
  purchase_price: z.coerce.number().min(0, 'Must be a positive number'),
  mrp: z.coerce.number().min(0, 'Must be a positive number'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  supplier_id: z.coerce.number().nullable().optional(),
  status: z.enum(['in_stock', 'sold', 'damaged']).default('in_stock')
});

export type ProductFormSchemaType = z.infer<typeof productSchema>;
