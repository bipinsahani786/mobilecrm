export interface QuotationItem {
  id: number;
  quotation_id: number;
  product_id: number;
  product_batch_id?: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: any;
  batch?: any;
}

export interface Quotation {
  id: number;
  business_id: number;
  customer_id?: number;
  user_id: number;
  quotation_number: string;
  total_amount: number;
  discount: number;
  round_off: number;
  final_amount: number;
  notes?: string;
  valid_until?: string;
  status: string;
  converted_sale_id?: number;
  date: string;
  created_at: string;
  customer?: any;
  user?: any;
  items?: QuotationItem[];
  convertedSale?: any;
}
