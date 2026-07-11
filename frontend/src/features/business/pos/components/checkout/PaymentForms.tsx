import React from 'react';
import { IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { PAYMENT_MODES, COMMON_FINANCIERS, type PaymentMode } from '../../constants/index';

interface PaymentFormsProps {
  paymentType: PaymentMode;
  setPaymentType: (type: PaymentMode) => void;
  register: any; // from react-form-hooks
  splitCash: number;
  splitUpi: number;
  splitCard: number;
  finalAmount: number;
}

export function PaymentForms({ 
  paymentType, 
  setPaymentType, 
  register, 
  splitCash, 
  splitUpi, 
  splitCard, 
  finalAmount 
}: PaymentFormsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider">Payment Mode</h3>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_MODES.map((mode) => (
            <Button 
              key={mode.id}
              type="button" 
              variant={paymentType === mode.id ? 'default' : 'outline'}
              onClick={() => setPaymentType(mode.id)}
              className={`w-full h-10 text-xs font-semibold rounded-lg transition-all ${
                paymentType === mode.id 
                  ? 'shadow-md shadow-primary-500/20 ring-1 ring-primary-500/50' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#09090b] p-4 rounded-xl border border-slate-200 dark:border-white/10 min-h-[220px] shadow-sm flex flex-col justify-center">
        {paymentType === 'cash' && (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
              <IndianRupee className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-center text-sm font-medium">Full amount will be recorded as paid.<br/><span className="text-xs font-normal">Select customer if you want to record Udhar.</span></p>
          </div>
        )}

        {paymentType === 'split' && (
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 w-24">Cash Amount</label>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" {...register('split_cash')} placeholder="0.00" className="h-9 pl-6 text-sm bg-slate-50 dark:bg-white/[0.02]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 w-24">UPI Amount</label>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" {...register('split_upi')} placeholder="0.00" className="h-9 pl-6 text-sm bg-slate-50 dark:bg-white/[0.02]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 w-24">Card Amount</label>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" {...register('split_card')} placeholder="0.00" className="h-9 pl-6 text-sm bg-slate-50 dark:bg-white/[0.02]" />
                </div>
              </div>
            </div>
            <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total Split:</span>
              <span className={`font-bold font-display text-lg ${Number(splitCash) + Number(splitUpi) + Number(splitCard) > finalAmount ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(Number(splitCash) + Number(splitUpi) + Number(splitCard))}
              </span>
            </div>
          </div>
        )}

        {paymentType === 'emi' && (
          <div className="space-y-3 w-full">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Financier Name *</label>
              <Input 
                list="financiers"
                {...register('emi_financier', { required: paymentType === 'emi' })} 
                placeholder="e.g. Bajaj Finserv" 
                className="h-9 text-sm bg-slate-50 dark:bg-white/[0.02]"
              />
              <datalist id="financiers">
                {COMMON_FINANCIERS.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Down Payment</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" {...register('emi_down_payment')} placeholder="0.00" className="h-9 pl-6 text-sm bg-slate-50 dark:bg-white/[0.02]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Loan Amount</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" {...register('emi_loan_amount')} readOnly className="h-9 pl-6 text-sm bg-slate-100 dark:bg-white/5 font-semibold text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Processing Fee</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" {...register('emi_processing_fee')} placeholder="0.00" className="h-9 pl-6 text-sm bg-slate-50 dark:bg-white/[0.02]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tenure (Months)</label>
                <Input type="number" {...register('emi_tenure')} placeholder="e.g. 6" className="h-9 text-sm bg-slate-50 dark:bg-white/[0.02]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Monthly EMI Amount</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                  <Input type="number" step="0.01" {...register('emi_monthly_amount')} placeholder="Auto calculated" className="h-9 pl-6 text-sm bg-slate-50 dark:bg-white/[0.02] font-semibold text-slate-700 dark:text-slate-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">First EMI Date</label>
                <Input type="date" {...register('emi_first_date')} className="h-9 text-sm bg-slate-50 dark:bg-white/[0.02]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

