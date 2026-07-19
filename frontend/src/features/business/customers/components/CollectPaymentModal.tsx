import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useUpdateSale } from '../../pos/api/useSales';
import { useCustomer } from '../api/useCustomers';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Trash2 } from 'lucide-react';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export function CollectPaymentModal({ isOpen, onClose, customer }: CollectPaymentModalProps) {
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [paymentRows, setPaymentRows] = useState<{ mode: string; amount: string }[]>([
    { mode: 'Cash', amount: '' }
  ]);
  const [notes, setNotes] = useState<string>('');
  const updateSale = useUpdateSale();

  // Fetch full customer details dynamically when modal is open and customer id is present
  const { data: fullCustomer, isLoading } = useCustomer(customer?.id);

  // Filter unpaid sales using the loaded fullCustomer
  const unpaidSales = fullCustomer?.sales?.filter((s: any) => Number(s.final_amount) - Number(s.paid_amount) > 0) || [];

  // Reset fields when open
  useEffect(() => {
    if (isOpen) {
      if (unpaidSales.length > 0) {
        setSelectedSaleId(String(unpaidSales[0].id));
        const balance = Number(unpaidSales[0].final_amount) - Number(unpaidSales[0].paid_amount);
        setPaymentRows([{ mode: 'Cash', amount: String(balance) }]);
      } else {
        setSelectedSaleId('');
        setPaymentRows([{ mode: 'Cash', amount: '' }]);
      }
      setNotes('');
    }
  }, [isOpen, fullCustomer, unpaidSales.length]);

  const selectedSale = unpaidSales.find((s: any) => String(s.id) === selectedSaleId);

  // Update default amount when selected sale changes
  useEffect(() => {
    if (selectedSale) {
      const balance = Number(selectedSale.final_amount) - Number(selectedSale.paid_amount);
      setPaymentRows([{ mode: 'Cash', amount: String(balance) }]);
    }
  }, [selectedSaleId]);

  // Calculate sum of payments entered
  const totalCollected = paymentRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const selectedSaleBalance = selectedSale ? (Number(selectedSale.final_amount) - Number(selectedSale.paid_amount)) : 0;
  const remainingBalance = selectedSaleBalance - totalCollected;

  const handleAddRow = () => {
    const defaultAmount = remainingBalance > 0 ? String(remainingBalance) : '';
    setPaymentRows(prev => [...prev, { mode: 'UPI', amount: defaultAmount }]);
  };

  const handleRemoveRow = (index: number) => {
    if (paymentRows.length === 1) return;
    setPaymentRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: 'mode' | 'amount', value: string) => {
    setPaymentRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) {
      toast.error('Please select an unpaid sale/invoice.');
      return;
    }
    if (totalCollected <= 0) {
      toast.error('Total payment amount must be greater than 0.');
      return;
    }
    if (totalCollected > selectedSaleBalance + 0.01) {
      toast.error(`Total payment cannot exceed the remaining balance of ${formatCurrency(selectedSaleBalance)}.`);
      return;
    }

    // Check for empty or invalid rows
    for (let i = 0; i < paymentRows.length; i++) {
      const row = paymentRows[i];
      const amt = Number(row.amount);
      if (isNaN(amt) || amt <= 0) {
        toast.error(`Please enter a valid amount for payment row #${i + 1}.`);
        return;
      }
    }

    try {
      // 1. Prepare items
      const items = (selectedSale.items || []).map((item: any) => ({
        product_id: item.product_id,
        product_batch_id: item.product_batch_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
      }));

      // 2. Prepare existing payments
      const payments = (selectedSale.payments || []).map((p: any) => ({
        payment_mode: p.payment_mode,
        amount: Number(p.amount),
        notes: p.notes,
        link_customer_id: p.link_customer_id || undefined,
      }));

      // 3. Add new split payments
      paymentRows.forEach((row) => {
        payments.push({
          payment_mode: row.mode,
          amount: Number(row.amount),
          notes: notes || 'Direct Payment Collection',
        });
      });

      // 4. Call update API
      await updateSale.mutateAsync({
        id: selectedSale.id,
        data: {
          customer_id: selectedSale.customer_id,
          discount: Number(selectedSale.discount || 0),
          round_off: Number(selectedSale.round_off || 0),
          payment_mode: selectedSale.payment_mode === 'EMI' ? 'EMI' : 'Split',
          date: selectedSale.date,
          notes: selectedSale.notes,
          items,
          payments,
          emi_detail: selectedSale.emiDetail ? {
            financier_name: selectedSale.emiDetail.financier_name,
            down_payment: Number(selectedSale.emiDetail.down_payment || 0),
            loan_amount: Number(selectedSale.emiDetail.loan_amount),
            processing_fee: Number(selectedSale.emiDetail.processing_fee || 0),
            tenure_months: selectedSale.emiDetail.tenure_months,
            monthly_installment_amount: Number(selectedSale.emiDetail.monthly_installment_amount),
            first_emi_date: selectedSale.emiDetail.first_emi_date,
          } : undefined
        }
      });

      toast.success('Split payment recorded successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collect Customer Payment">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        {isLoading ? (
          <p className="text-center text-sm text-slate-500 py-6">
            Loading unpaid invoice details...
          </p>
        ) : unpaidSales.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-6">
            This customer has no unpaid invoices or outstanding balance.
          </p>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Select Invoice / Sale
              </label>
              <CustomSelect
                value={selectedSaleId}
                onChange={setSelectedSaleId}
                options={unpaidSales.map((s: any) => {
                  const balance = Number(s.final_amount) - Number(s.paid_amount);
                  return {
                    value: String(s.id),
                    label: `${s.invoice_number} (Bal: ${formatCurrency(balance)})`,
                  };
                })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Split Payments
              </label>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {paymentRows.map((row, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <CustomSelect
                        value={row.mode}
                        onChange={(val) => handleRowChange(index, 'mode', val)}
                        menuPosition="fixed"
                        options={[
                          { value: 'Cash', label: 'Cash' },
                          { value: 'UPI', label: 'UPI' },
                          { value: 'Card', label: 'Card' },
                        ]}
                      />
                    </div>
                    
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={row.amount}
                        onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                        className="w-full h-10 pl-7 pr-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold"
                      />
                    </div>

                    {paymentRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRow(index)}
                        className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="w-full border-dashed border-slate-200 dark:border-white/10 hover:border-slate-300 rounded-xl text-xs font-bold py-2 mt-1 h-9 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Payment Mode
              </Button>
            </div>

            {/* Sum Summaries */}
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs font-semibold">
              <div className="text-slate-500">
                Total Collected: <span className="font-extrabold text-slate-800 dark:text-white">{formatCurrency(totalCollected)}</span>
              </div>
              <div className={remainingBalance < 0 ? 'text-rose-500 font-extrabold' : 'text-slate-500'}>
                {remainingBalance < 0 
                  ? `Overpaid by: ${formatCurrency(Math.abs(remainingBalance))}` 
                  : `Remaining: ${formatCurrency(remainingBalance)}`
                }
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Received cash & UPI from customer"
                className="w-full h-20 p-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={updateSale.isPending || remainingBalance < 0}>
                {updateSale.isPending ? 'Saving...' : 'Record Payment'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
