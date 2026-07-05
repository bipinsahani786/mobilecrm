export interface Business {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  phone_2: string | null;
  gst_number: string | null;
  address: string | null;
  pincode: string | null;
  state: string | null;
  description: string | null;
  business_type: string | null;
  business_category: string | null;
  books_opening_date: string | null;
  logo_path: string | null;
  signature_path: string | null;
  card_preferences: {
    show_address?: boolean;
    show_email?: boolean;
    show_phone_2?: boolean;
    show_gst?: boolean;
  } | null;
}
