import type { FormSectionConfig } from '@/components/ui/dynamic-form';

export const paymentFormConfig: FormSectionConfig[] = [
  {
    fields: [
      {
        name: 'amount',
        label: 'Amount Paid',
        type: 'custom',
        required: true,
        render: (form) => {
          const mode = form.watch('payment_mode');
          const isSplit = mode === 'Split Payment';
          return (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Amount Paid *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                readOnly={isSplit}
                {...form.register('amount')}
                className={`flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:text-slate-50 dark:focus:ring-primary-400 ${
                  isSplit ? 'bg-slate-100 dark:bg-white/5 opacity-70 cursor-not-allowed' : 'bg-transparent'
                }`}
              />
              {form.formState.errors.amount && (
                <span className="text-red-500 text-xs">{form.formState.errors.amount.message as string}</span>
              )}
            </div>
          );
        },
      },
      {
        name: 'payment_mode',
        label: 'Payment Mode',
        type: 'select',
        required: true,
        options: [
          { value: 'Cash', label: 'Cash' },
          { value: 'UPI', label: 'UPI' },
          { value: 'Debit Card', label: 'Debit Card' },
          { value: 'Credit Card', label: 'Credit Card' },
          { value: 'Bank Transfer', label: 'Bank Transfer' },
          { value: 'Cheque', label: 'Cheque' },
          { value: 'Split Payment', label: 'Split Payment' },
        ],
      },
      {
        name: 'split_fields',
        label: '',
        type: 'custom',
        colSpan: 2,
        render: (form) => {
          const mode = form.watch('payment_mode');
          if (mode !== 'Split Payment') return null;
          return (
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cash Amount</label>
                <input type="number" step="0.01" {...form.register('split_cash')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:bg-[#111118] dark:text-slate-50" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">UPI Amount</label>
                <input type="number" step="0.01" {...form.register('split_upi')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:bg-[#111118] dark:text-slate-50" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Debit Card Amount</label>
                <input type="number" step="0.01" {...form.register('split_debit_card')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:bg-[#111118] dark:text-slate-50" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Credit Card Amount</label>
                <input type="number" step="0.01" {...form.register('split_credit_card')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:bg-[#111118] dark:text-slate-50" placeholder="0" />
              </div>
            </div>
          );
        },
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
