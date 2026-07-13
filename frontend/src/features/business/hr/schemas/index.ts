import { z } from 'zod';

export const leaveSchema = z.object({
  leave_type: z.string().min(1, 'Leave type is required'),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export const leaveFormConfig = [
  { name: 'leave_type', label: 'Leave Type', type: 'select', options: [
    { label: 'Sick Leave', value: 'sick' },
    { label: 'Casual Leave', value: 'casual' },
    { label: 'Earned Leave', value: 'earned' },
    { label: 'Unpaid Leave', value: 'unpaid' }
  ], required: true, tooltip: 'Select the category of leave you are requesting.' },
  { name: 'from_date', label: 'From Date', type: 'date', required: true, tooltip: 'The starting date of your leave period.' },
  { name: 'to_date', label: 'To Date', type: 'date', required: true, tooltip: 'The end date of your leave period (inclusive).' },
  { name: 'reason', label: 'Reason for Leave', type: 'textarea', required: true, tooltip: 'Provide a brief explanation for requesting this leave.' }
];

export const advanceSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export const advanceFormConfig = [
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, tooltip: 'The total amount of salary advance you are requesting.' },
  { name: 'date', label: 'Needed By Date', type: 'date', required: true, tooltip: 'The target date when you need the advance amount in hand.' },
  { name: 'reason', label: 'Reason for Advance', type: 'textarea', required: true, tooltip: 'Explain why you need this salary advance.' }
];
