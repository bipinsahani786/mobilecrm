import React, { useState } from 'react';
import { Banknote, Smartphone, CreditCard, GitMerge, BarChart2, IndianRupee, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { formatCurrency } from '@/lib/formatters';
import { PAYMENT_MODES, COMMON_FINANCIERS, type PaymentMode } from '../../constants/index';
import { useCreateCustomer } from '../../../customers/api/useCustomers';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PaymentFormsProps {
  paymentType: PaymentMode;
  setPaymentType: (type: PaymentMode) => void;
  register: any;
  splitPayments: { mode: string; amount: string; link_customer_id?: string }[];
  setSplitPayments: (payments: { mode: string; amount: string; link_customer_id?: string }[]) => void;
  finalAmount: number;
  emiDownPaymentMode?: string;
  setEmiDownPaymentMode?: (val: string) => void;
  emiDownPayments?: { mode: string; amount: string; link_customer_id?: string }[];
  setEmiDownPayments?: (payments: { mode: string; amount: string; link_customer_id?: string }[]) => void;
  customers?: any[];
  isManualEmi?: boolean;
  setIsManualEmi?: (val: boolean) => void;
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

export function PaymentForms({ 
  paymentType, 
  setPaymentType, 
  register, 
  splitPayments, 
  setSplitPayments, 
  finalAmount, 
  emiDownPaymentMode, 
  setEmiDownPaymentMode,
  emiDownPayments = [],
  setEmiDownPayments = () => {},
  customers = [],
  isManualEmi = false,
  setIsManualEmi = () => {}
}: PaymentFormsProps) {
  const splitTotal = splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const splitOver  = splitTotal > finalAmount;
  const remaining  = finalAmount - splitTotal;

  // Guarantor states for Split payments
  const [addingStates, setAddingStates] = useState<Record<number, boolean>>({});
  const [newCustNames, setNewCustNames] = useState<Record<number, string>>({});
  const [newCustPhones, setNewCustPhones] = useState<Record<number, string>>({});
  const [newCustAddresses, setNewCustAddresses] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});

  // Guarantor states for EMI Downpayments
  const [addingDownpaymentStates, setAddingDownpaymentStates] = useState<Record<number, boolean>>({});
  const [newDownpaymentCustNames, setNewDownpaymentCustNames] = useState<Record<number, string>>({});
  const [newDownpaymentCustPhones, setNewDownpaymentCustPhones] = useState<Record<number, string>>({});
  const [newDownpaymentCustAddresses, setNewDownpaymentCustAddresses] = useState<Record<number, string>>({});
  const [isDownpaymentSaving, setIsDownpaymentSaving] = useState<Record<number, boolean>>({});

  const createCustomer = useCreateCustomer();
  const queryClient = useQueryClient();

  const handleCreateGuarantor = async (index: number, isDownpayment: boolean) => {
    const name = isDownpayment ? newDownpaymentCustNames[index] : newCustNames[index];
    const phone = isDownpayment ? newDownpaymentCustPhones[index] : newCustPhones[index];
    const address = isDownpayment ? newDownpaymentCustAddresses[index] : newCustAddresses[index];

    if (!name?.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const setSaving = isDownpayment ? setIsDownpaymentSaving : setIsSaving;
    setSaving(prev => ({ ...prev, [index]: true }));

    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: name.trim(),
        phone: phone?.trim() || undefined,
        address: address?.trim() || undefined,
      });

      toast.success(`Guarantor ${newCustomer.name} added successfully!`);

      // Invalidate queries so select list updates
      await queryClient.invalidateQueries({ queryKey: ['customers'] });

      // Update the payment link customer ID with the newly created customer ID
      if (isDownpayment) {
        const newPayments = [...emiDownPayments];
        newPayments[index].link_customer_id = String(newCustomer.id);
        setEmiDownPayments(newPayments);

        // Reset states
        setAddingDownpaymentStates(prev => ({ ...prev, [index]: false }));
        setNewDownpaymentCustNames(prev => ({ ...prev, [index]: '' }));
        setNewDownpaymentCustPhones(prev => ({ ...prev, [index]: '' }));
        setNewDownpaymentCustAddresses(prev => ({ ...prev, [index]: '' }));
      } else {
        const newPayments = [...splitPayments];
        newPayments[index].link_customer_id = String(newCustomer.id);
        setSplitPayments(newPayments);

        // Reset states
        setAddingStates(prev => ({ ...prev, [index]: false }));
        setNewCustNames(prev => ({ ...prev, [index]: '' }));
        setNewCustPhones(prev => ({ ...prev, [index]: '' }));
        setNewCustAddresses(prev => ({ ...prev, [index]: '' }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setSaving(prev => ({ ...prev, [index]: false }));
    }
  };

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
                onClick={() => {
                  setPaymentType(mode.id);
                  if (mode.id === 'split' && splitPayments.length < 2) {
                    setSplitPayments([
                      { mode: 'Cash', amount: '' },
                      { mode: 'Net Banking', amount: '' }
                    ]);
                  }
                }}
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
          <div className="space-y-4 w-full">
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {splitPayments.map((payment, index) => (
                <div key={index} className="space-y-1.5 p-2 bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-xl animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 group">
                    <div className="w-1/2">
                      <CustomSelect
                        value={payment.mode}
                        onChange={(value) => {
                          const newPayments = [...splitPayments];
                          newPayments[index].mode = value;
                          if (value !== 'Udhar') {
                            delete newPayments[index].link_customer_id;
                          }
                          setSplitPayments(newPayments);
                        }}
                        options={[
                          { value: 'Cash', label: 'Cash' },
                          { value: 'Net Banking', label: 'Net Banking' },
                          { value: 'UPI', label: 'UPI' },
                          { value: 'Card', label: 'Card' },
                          { value: 'Udhar', label: 'Udhar (Credit)' },
                        ]}
                      />
                    </div>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                      <Input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => {
                          const newPayments = [...splitPayments];
                          newPayments[index].amount = e.target.value;
                          setSplitPayments(newPayments);
                        }}
                        placeholder="0.00"
                        className="h-9 pl-7 text-sm bg-slate-50 dark:bg-white/[0.03]"
                      />
                    </div>
                    {splitPayments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPayments = splitPayments.filter((_, i) => i !== index);
                          setSplitPayments(newPayments);
                        }}
                        className="h-9 w-9 flex items-center justify-center border border-rose-200 dark:border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {payment.mode === 'Udhar' && (
                    <div className="w-full space-y-1 animate-in fade-in duration-200">
                      {!addingStates[index] ? (
                        <div className="space-y-1">
                          <CustomSelect
                            value={payment.link_customer_id || ''}
                            onChange={(value) => {
                              const newPayments = [...splitPayments];
                              newPayments[index].link_customer_id = value;
                              setSplitPayments(newPayments);
                            }}
                            placeholder="-- Select Debtor Customer * --"
                            options={customers.map((c: any) => ({
                              value: String(c.id),
                              label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`
                            }))}
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setAddingStates(prev => ({ ...prev, [index]: true }));
                              }}
                              className="text-[10px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer py-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create New Customer</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-primary-50/50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/15 rounded-xl space-y-2 animate-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input
                              placeholder="Name *"
                              value={newCustNames[index] || ''}
                              onChange={(e) => {
                                setNewCustNames(prev => ({ ...prev, [index]: e.target.value }));
                              }}
                              className="h-8 text-xs bg-white dark:bg-zinc-900"
                            />
                            <Input
                              placeholder="Phone"
                              value={newCustPhones[index] || ''}
                              onChange={(e) => {
                                setNewCustPhones(prev => ({ ...prev, [index]: e.target.value }));
                              }}
                              className="h-8 text-xs bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <Input
                            placeholder="Address (Optional)"
                            value={newCustAddresses[index] || ''}
                            onChange={(e) => {
                              setNewCustAddresses(prev => ({ ...prev, [index]: e.target.value }));
                            }}
                            className="h-8 text-xs bg-white dark:bg-zinc-900 w-full"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAddingStates(prev => ({ ...prev, [index]: false }));
                              }}
                              className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSaving[index]}
                              onClick={() => handleCreateGuarantor(index, false)}
                              className="px-3 py-1 bg-primary-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider disabled:opacity-50"
                            >
                              {isSaving[index] ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSplitPayments([...splitPayments, { mode: 'UPI', amount: '' }])}
              className="flex items-center justify-center gap-1.5 w-full h-9 border border-dashed border-primary-300 dark:border-primary-500/30 hover:border-primary-500 text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment Mode</span>
            </button>

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
              <div className="col-span-2 space-y-2.5 border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-white dark:bg-white/[0.02]">
                <div className="flex items-end gap-2.5 w-full">
                  <div className="flex-1 min-w-[140px]">
                    <FieldLabel>Down Pmt Mode</FieldLabel>
                    <CustomSelect
                      value={emiDownPaymentMode || 'Cash'}
                      onChange={(value) => {
                        if (setEmiDownPaymentMode) setEmiDownPaymentMode(value);
                        if (value === 'Split' && setEmiDownPayments && emiDownPayments.length < 2) {
                          setEmiDownPayments([
                            { mode: 'Cash', amount: '' },
                            { mode: 'Net Banking', amount: '' }
                          ]);
                        }
                      }}
                      options={[
                        { value: 'Cash', label: 'Cash' },
                        { value: 'UPI', label: 'UPI' },
                        { value: 'Card', label: 'Card' },
                        { value: 'Net Banking', label: 'Net Banking' },
                        { value: 'Split', label: 'Split Payment' },
                      ]}
                    />
                  </div>
                  {emiDownPaymentMode !== 'Split' && (
                    <div className="flex-1">
                      <FieldLabel>Down Payment Amount</FieldLabel>
                      <AmountInput type="number" {...register('emi_down_payment')} placeholder="0.00" />
                    </div>
                  )}
                </div>

                {emiDownPaymentMode === 'Split' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="max-h-[160px] overflow-y-auto space-y-2.5 pr-1">
                      {emiDownPayments.map((payment, index) => (
                        <div key={index} className="space-y-1.5 p-2 bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-xl animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 group">
                            <div className="w-1/2">
                              <CustomSelect
                                value={payment.mode}
                                onChange={(value) => {
                                  const newPayments = [...emiDownPayments];
                                  newPayments[index].mode = value;
                                  if (value !== 'Udhar') {
                                    delete newPayments[index].link_customer_id;
                                  }
                                  setEmiDownPayments(newPayments);
                                }}
                                options={[
                                  { value: 'Cash', label: 'Cash' },
                                  { value: 'UPI', label: 'UPI' },
                                  { value: 'Card', label: 'Card' },
                                  { value: 'Net Banking', label: 'Net Banking' },
                                  { value: 'Udhar', label: 'Udhar (Credit)' },
                                ]}
                              />
                            </div>
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                              <Input
                                type="number"
                                value={payment.amount}
                                onChange={(e) => {
                                  const newPayments = [...emiDownPayments];
                                  newPayments[index].amount = e.target.value;
                                  setEmiDownPayments(newPayments);
                                }}
                                placeholder="0.00"
                                className="h-9 pl-7 text-sm bg-slate-50 dark:bg-white/[0.03]"
                              />
                            </div>
                            {emiDownPayments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPayments = emiDownPayments.filter((_, i) => i !== index);
                                  setEmiDownPayments(newPayments);
                                }}
                                className="h-9 w-9 flex items-center justify-center border border-rose-200 dark:border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {payment.mode === 'Udhar' && (
                            <div className="w-full space-y-1 animate-in fade-in duration-200">
                              {!addingDownpaymentStates[index] ? (
                                <div className="space-y-1">
                                  <CustomSelect
                                    value={payment.link_customer_id || ''}
                                    onChange={(value) => {
                                      const newPayments = [...emiDownPayments];
                                      newPayments[index].link_customer_id = value;
                                      setEmiDownPayments(newPayments);
                                    }}
                                    placeholder="-- Select Debtor Customer * --"
                                    options={customers.map((c: any) => ({
                                      value: String(c.id),
                                      label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`
                                    }))}
                                  />
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddingDownpaymentStates(prev => ({ ...prev, [index]: true }));
                                      }}
                                      className="text-[10px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer py-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Create New Customer</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2 bg-primary-50/50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/15 rounded-xl space-y-2 animate-in slide-in-from-top-1 duration-200">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <Input
                                      placeholder="Name *"
                                      value={newDownpaymentCustNames[index] || ''}
                                      onChange={(e) => {
                                        setNewDownpaymentCustNames(prev => ({ ...prev, [index]: e.target.value }));
                                      }}
                                      className="h-8 text-xs bg-white dark:bg-zinc-900"
                                    />
                                    <Input
                                      placeholder="Phone"
                                      value={newDownpaymentCustPhones[index] || ''}
                                      onChange={(e) => {
                                        setNewDownpaymentCustPhones(prev => ({ ...prev, [index]: e.target.value }));
                                      }}
                                      className="h-8 text-xs bg-white dark:bg-zinc-900"
                                    />
                                  </div>
                                  <Input
                                    placeholder="Address (Optional)"
                                    value={newDownpaymentCustAddresses[index] || ''}
                                    onChange={(e) => {
                                      setNewDownpaymentCustAddresses(prev => ({ ...prev, [index]: e.target.value }));
                                    }}
                                    className="h-8 text-xs bg-white dark:bg-zinc-900 w-full"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddingDownpaymentStates(prev => ({ ...prev, [index]: false }));
                                      }}
                                      className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDownpaymentSaving[index]}
                                      onClick={() => handleCreateGuarantor(index, true)}
                                      className="px-3 py-1 bg-primary-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider disabled:opacity-50"
                                    >
                                      {isDownpaymentSaving[index] ? 'Saving…' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setEmiDownPayments([...emiDownPayments, { mode: 'Cash', amount: '' }])}
                      className="flex items-center justify-center gap-1.5 w-full h-9 border border-dashed border-primary-300 dark:border-primary-500/30 hover:border-primary-500 text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Downpayment Mode</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <FieldLabel>Loan Amount</FieldLabel>
                <AmountInput type="number" {...register('emi_loan_amount')} readOnly className="bg-primary-50 dark:bg-primary-500/10 font-bold text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-500/30" />
              </div>
              <div>
                <FieldLabel>Tenure (Months)</FieldLabel>
                <Input type="number" {...register('emi_tenure')} placeholder="e.g. 6" className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Processing Fee</FieldLabel>
                <AmountInput type="number" {...register('emi_processing_fee')} placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Monthly EMI
                  </label>
                  {isManualEmi && (
                    <button
                      type="button"
                      onClick={() => setIsManualEmi && setIsManualEmi(false)}
                      className="text-[9px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      🔄 Reset Auto
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('emi_monthly_amount')}
                    onChange={(e: any) => {
                      register('emi_monthly_amount').onChange(e);
                      setIsManualEmi && setIsManualEmi(true);
                    }}
                    placeholder="Auto"
                    className="h-9 pl-7 text-sm bg-slate-50 dark:bg-white/[0.03] font-bold text-primary-700 dark:text-primary-300"
                  />
                </div>
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
