import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const paymentFormConfig: FormSectionConfig[] = [
  {
    fields: [
      {
        name: 'amount',
        label: 'Amount Paid',
        type: 'number',
        required: true,
        placeholder: 'e.g. 5000',
        step: '0.01',
      },
      {
        name: 'payment_mode',
        label: 'Payment Mode',
        type: 'select',
        required: true,
        options: [
          { value: 'cash', label: 'Cash' },
          { value: 'upi', label: 'UPI' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'cheque', label: 'Cheque' },
        ],
      },
      {
        name: 'date',
        label: 'Payment Date',
        type: 'custom',
        required: true,
        render: (form) => (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Payment Date *
            </label>
            <input
              type="date"
              {...form.register('date')}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-50 dark:focus:ring-primary-400"
            />
            {form.formState.errors.date && (
              <span className="text-red-500 text-xs">{form.formState.errors.date.message as string}</span>
            )}
          </div>
        ),
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Transaction ID, Cheque No. etc.',
        colSpan: 2,
      },
    ],
  },
];
