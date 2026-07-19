import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  email: z.string().email('Invalid email format').or(z.literal('')).nullable().optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid phone number format').or(z.literal('')).nullable().optional(),
  phone_2: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid phone number format').or(z.literal('')).nullable().optional(),
  gst_number: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)').or(z.literal('')).nullable().optional(),
  address: z.string().or(z.literal('')).nullable().optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode (6 digits required)').or(z.literal('')).nullable().optional(),
  state: z.string().or(z.literal('')).nullable().optional(),
  description: z.string().or(z.literal('')).nullable().optional(),
  business_type: z.string().or(z.literal('')).nullable().optional(),
  business_category: z.string().or(z.literal('')).nullable().optional(),
  books_opening_date: z.string().or(z.literal('')).nullable().optional(),
  card_preferences: z.object({
    show_address: z.boolean().default(true),
    show_email: z.boolean().default(true),
    show_phone_2: z.boolean().default(true),
    show_gst: z.boolean().default(true),
    theme: z.enum(['dark', 'primary', 'blue', 'green', 'purple']).default('primary')
  }).default({
    show_address: true,
    show_email: true,
    show_phone_2: true,
    show_gst: true,
    theme: 'primary'
  }),
    settings: z.object({
    commission_calculation_base: z.enum(['sales', 'profit']).default('sales'),
    sale_invoice_prefix: z.string().default('INV-'),
    purchase_invoice_prefix: z.string().default('PUR-'),
    whitelabel_name: z.string().nullable().optional(),
    whitelabel_logo: z.string().nullable().optional(),
    whitelabel_favicon: z.string().nullable().optional(),
    invoice_header_image: z.string().nullable().optional(),
    invoice_footer_image: z.string().nullable().optional(),
  }).default({
    commission_calculation_base: 'sales',
    sale_invoice_prefix: 'INV-',
    purchase_invoice_prefix: 'PUR-'
  })
});

export type BusinessFormValues = z.infer<typeof businessSchema>;
