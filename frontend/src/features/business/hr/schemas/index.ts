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
  ], required: true },
  { name: 'from_date', label: 'From Date', type: 'date', required: true },
  { name: 'to_date', label: 'To Date', type: 'date', required: true },
  { name: 'reason', label: 'Reason for Leave', type: 'textarea', required: true }
];

export const advanceSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export const advanceFormConfig = [
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
  { name: 'date', label: 'Needed By Date', type: 'date', required: true },
  { name: 'reason', label: 'Reason for Advance', type: 'textarea', required: true }
];
