import React from 'react';
import { Banknote, Smartphone, CreditCard, GitMerge, BarChart2, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import { PAYMENT_MODES, COMMON_FINANCIERS, type PaymentMode } from '../../constants/index';

interface PaymentFormsProps {
  paymentType: PaymentMode;
  setPaymentType: (type: PaymentMode) => void;
  register: any;
  splitCash: number;
  splitUpi: number;
  splitCard: number;
  finalAmount: number;
}

const paymentIcons: Record<string, React.ReactNode> = {
  cash:  <Banknote className="w-4 h-4" />,
  upi:   <Smartphone className="w-4 h-4" />,
  card:  <CreditCard className="w-4 h-4" />,
  split: <GitMerge className="w-4 h-4" />,
  emi:   <BarChart2 className="w-4 h-4" />,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
      {children}
    </label>
  );
}

function AmountInput({ prefix = '₹', ...props }: any) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
      <Input {...props} className={`h-9 pl-7 text-sm bg-slate-50 dark:bg-white/[0.03] ${props.className ?? ''}`} />
    </div>
  );
}

export function PaymentForms({ paymentType, setPaymentType, register, splitCash, splitUpi, splitCard, finalAmount }: PaymentFormsProps) {
  const splitTotal = Number(splitCash) + Number(splitUpi) + Number(splitCard);
  const splitOver  = splitTotal > finalAmount;
  const remaining  = finalAmount - splitTotal;

  return (
    <div className="space-y-4">

      {/* Mode Selector */}
      <div>
        <FieldLabel>Payment Mode</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_MODES.map((mode) => {
            const active = paymentType === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPaymentType(mode.id)}
                className={[
                  'flex flex-col items-center justify-center gap-1 h-16 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200',
                  active
                    ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/30 -translate-y-0.5'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-500/40 hover:text-primary-500 dark:hover:text-primary-400',
                ].join(' ')}
              >
                {paymentIcons[mode.id]}
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Content */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-4 min-h-[200px] flex flex-col justify-center">

        {/* Cash */}
        {paymentType === 'cash' && (
          <div className="flex flex-col items-center justify-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center">
              <IndianRupee className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Full Cash Payment</p>
              <p className="text-2xl font-black text-primary-600 dark:text-primary-400 font-display mt-1">{formatCurrency(finalAmount)}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Full amount will be recorded as paid.</p>
            </div>
          </div>
        )}

        {/* Split */}
        {paymentType === 'split' && (
          <div className="space-y-3 w-full">
            <div className="space-y-2.5">
              <div>
                <FieldLabel>Cash Amount</FieldLabel>
                <AmountInput type="number" {...register('split_cash')} placeholder="0.00" />
              </div>
              <div>
                <FieldLabel>UPI Amount</FieldLabel>
                <AmountInput type="number" {...register('split_upi')} placeholder="0.00" />
              </div>
              <div>
                <FieldLabel>Card Amount</FieldLabel>
                <AmountInput type="number" {...register('split_card')} placeholder="0.00" />
              </div>
            </div>

            <div className={`pt-3 border-t space-y-2.5 ${splitOver ? 'border-rose-200 dark:border-rose-500/30' : 'border-slate-200 dark:border-white/10'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total split:</span>
                <span className={`text-base font-black font-display ${splitOver ? 'text-rose-500' : 'text-primary-600 dark:text-primary-400'}`}>
                  {formatCurrency(splitTotal)}
                  {splitOver && <span className="text-[10px] ml-1 text-rose-400">(over!)</span>}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Remaining to split:</span>
                <span className={`text-sm font-extrabold font-display ${remaining > 0 ? 'text-amber-500' : remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {remaining < 0 ? `Overpaid by ${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* EMI */}
        {paymentType === 'emi' && (
          <div className="space-y-3 w-full">
            <div>
              <FieldLabel>Financier Name *</FieldLabel>
              <Input
                list="financiers"
                {...register('emi_financier', { required: paymentType === 'emi' })}
                placeholder="e.g. Bajaj Finserv"
                className="h-9 text-sm"
              />
              <datalist id="financiers">
                {COMMON_FINANCIERS.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <FieldLabel>Down Payment</FieldLabel>
                <AmountInput type="number" {...register('emi_down_payment')} placeholder="0.00" />
              </div>
              <div>
                <FieldLabel>Loan Amount</FieldLabel>
                <AmountInput type="number" {...register('emi_loan_amount')} readOnly className="bg-primary-50 dark:bg-primary-500/10 font-bold text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-500/30" />
              </div>
              <div>
                <FieldLabel>Processing Fee</FieldLabel>
                <AmountInput type="number" {...register('emi_processing_fee')} placeholder="0.00" />
              </div>
              <div>
                <FieldLabel>Tenure (Months)</FieldLabel>
                <Input type="number" {...register('emi_tenure')} placeholder="e.g. 6" className="h-9 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <FieldLabel>Monthly EMI</FieldLabel>
                <AmountInput type="number" step="0.01" {...register('emi_monthly_amount')} placeholder="Auto" className="font-bold text-primary-700 dark:text-primary-300" />
              </div>
              <div>
                <FieldLabel>First EMI Date</FieldLabel>
                <Input type="date" {...register('emi_first_date')} className="h-9 text-sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
