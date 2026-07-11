export const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash / UPI' },
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
