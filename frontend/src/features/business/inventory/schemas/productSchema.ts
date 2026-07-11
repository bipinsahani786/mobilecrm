import { z } from 'zod';
import type { Category } from './categorySchema';
import type { Brand } from './brandSchema';

// --- Interfaces ---
export interface ProductBatch {
  id: number;
  batch_number: string | null;
  original_quantity: number;
  remaining_quantity: number;
  purchase_price: number;
  mrp: number;
  created_at: string;
}

export interface Product {
  id: number;
  business_id: number;
  category_id: number;
  brand_id: number | null;
  model_name: string;
  imei: string | null;
  serial_no: string | null;
  variant: string | null;
  purchase_price: number;
  mrp: number;
  quantity: number;
  supplier_id: number | null;
  status: 'in_stock' | 'sold' | 'damaged';
  category?: Category;
  brand?: Brand;
  batches?: ProductBatch[];
  created_at: string;
}

export interface InventoryQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  brand_id?: number;
  low_stock_days?: number | string;
}

// --- Zod Schemas ---
export const productSchema = z.object({
  category_id: z.coerce.number().min(1, 'Category is required'),
  brand_id: z.coerce.number().optional().or(z.literal('')),
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

export type ProductFormValues = z.infer<typeof productSchema>;
