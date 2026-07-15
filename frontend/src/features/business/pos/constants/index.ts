export const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'udhar', label: 'Credit (Udhar)' },
  { id: 'split', label: 'Split' },
  { id: 'emi', label: 'Finance / EMI' },
] as const;

export type PaymentMode = typeof PAYMENT_MODES[number]['id'];

export const COMMON_FINANCIERS = [
  'Bajaj Finserv',
  'TVS Credit',
  'HDB Financial',
  'Home Credit',
  'IDFC First Bank',
  'Pine Labs'
];
