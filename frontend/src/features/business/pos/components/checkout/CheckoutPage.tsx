import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useCreateSale, useUpdateSale } from '../../api/useSales';
import { useCustomers, useCreateCustomer } from '../../../customers/api/useCustomers';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { COMMON_FINANCIERS } from '../../constants/index';
import { DatePicker } from '@/components/ui/DatePicker';
import type { CartItem } from '../../schemas/saleSchema';
import {
  ArrowLeft, Plus, UserPlus, X, CreditCard, Banknote, Smartphone,
  GitMerge, BarChart2, IndianRupee, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';

interface CheckoutPageProps {
  cartItems: CartItem[];
  cartTotal: number;
  draftId?: number;
  initialDraftData?: any;
  onCancel: () => void;
  onSuccess: (saleId?: number, isDraft?: boolean) => void;
}

export function CheckoutPage({ cartItems, cartTotal, draftId, initialDraftData, onCancel, onSuccess }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<string>(initialDraftData?.payment_mode?.toLowerCase() || 'cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialDraftData?.customer_id ? String(initialDraftData.customer_id) : '');

  // IMEI / Serial No states
  const [identifiers, setIdentifiers] = useState<Record<string, { imei_1: string; imei_2: string; serial_no: string }[]>>({});
  const [itemModes, setItemModes] = useState<Record<string, ('serial' | 'imei')[]>>({});

  // Split and EMI States
  const [splitPayments, setSplitPayments] = useState<{ mode: string; amount: string; link_customer_id?: string }[]>(() => {
    if (initialDraftData?.payment_mode?.toLowerCase() === 'split' && initialDraftData?.payments) {
       return initialDraftData.payments.map((p: any) => ({
          mode: p.payment_mode,
          amount: String(p.amount),
          link_customer_id: p.link_customer_id ? String(p.link_customer_id) : undefined
       }));
    }
    return [{ mode: 'Cash', amount: '' }];
  });
  
  const [emiDownPaymentMode, setEmiDownPaymentMode] = useState<string>(() => {
     if (initialDraftData?.payment_mode?.toLowerCase() === 'emi' && initialDraftData?.payments) {
         if (initialDraftData.payments.length > 1) return 'Split';
         if (initialDraftData.payments.length === 1) return initialDraftData.payments[0].payment_mode;
     }
     return 'Cash';
  });

  const [emiDownPayments, setEmiDownPayments] = useState<{ mode: string; amount: string; link_customer_id?: string }[]>(() => {
    if (initialDraftData?.payment_mode?.toLowerCase() === 'emi' && initialDraftData?.payments) {
       return initialDraftData.payments.map((p: any) => ({
          mode: p.payment_mode,
          amount: String(p.amount),
          link_customer_id: p.link_customer_id ? String(p.link_customer_id) : undefined
       }));
    }
    return [{ mode: 'Cash', amount: '' }];
  });
  const [isManualEmi, setIsManualEmi] = useState(false);

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

  // Direct Udhar Guarantor states
  const [linkGuarantor, setLinkGuarantor] = useState(() => {
     if (initialDraftData?.payment_mode?.toLowerCase() === 'udhar' && initialDraftData?.payments?.[0]?.link_customer_id) return true;
     return false;
  });
  const [guarantorCustomerId, setGuarantorCustomerId] = useState(() => {
     if (initialDraftData?.payment_mode?.toLowerCase() === 'udhar' && initialDraftData?.payments?.[0]?.link_customer_id) {
         return String(initialDraftData.payments[0].link_customer_id);
     }
     return '';
  });
  const [isAddingGuarantorCustomer, setIsAddingGuarantorCustomer] = useState(false);
  const [quickGuarantorName, setQuickGuarantorName] = useState('');
  const [quickGuarantorPhone, setQuickGuarantorPhone] = useState('');
  const [quickGuarantorAddress, setQuickGuarantorAddress] = useState('');
  const [isSavingGuarantor, setIsSavingGuarantor] = useState(false);

  // Customer states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickCustName, setQuickCustName] = useState('');
  const [quickCustPhone, setQuickCustPhone] = useState('');
  const [quickCustAddress, setQuickCustAddress] = useState('');

  const { data: customersResponse } = useCustomers(1, 200);
  const customers = customersResponse?.data || [];

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      discount: initialDraftData?.discount || 0,
      round_off: initialDraftData?.round_off || 0,
      emi_financier: initialDraftData?.emi_detail?.financier_name || '',
      emi_down_payment_mode: 'Cash',
      emi_down_payment: initialDraftData?.emi_detail?.down_payment || 0,
      emi_tenure: initialDraftData?.emi_detail?.tenure_months || 6,
      emi_processing_fee: initialDraftData?.emi_detail?.processing_fee || 0,
      emi_monthly_amount: initialDraftData?.emi_detail?.monthly_installment_amount || '',
      emi_first_date: initialDraftData?.emi_detail?.first_emi_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      emi_loan_amount: initialDraftData?.emi_detail?.loan_amount || 0,
    }
  });

  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const createCustomer = useCreateCustomer();
  const isDrafting = React.useRef(false);

  // Initialize identifiers & input modes for each cart item unit
  useEffect(() => {
    const initialModes: Record<string, ('serial' | 'imei')[]> = {};
    const initialIdentifiers: Record<string, { imei_1: string; imei_2: string; serial_no: string }[]> = {};

    cartItems.forEach(item => {
      // Default to 'imei' if category name contains phone/mobile/sim, else default to 'serial'
      const isPhone = item.category_name?.toLowerCase().includes('phone') ||
        item.category_name?.toLowerCase().includes('mobile') ||
        item.category_name?.toLowerCase().includes('smartphone') ||
        item.category_name?.toLowerCase().includes('sim') ||
        item.model_name?.toLowerCase().includes('phone') ||
        item.model_name?.toLowerCase().includes('mobile');

      const defaultMode = isPhone ? 'imei' : 'serial';

      const draftItemMatches = initialDraftData?.items?.filter((di: any) => 
         `${di.product_id}${di.product_batch_id ? '-' + di.product_batch_id : ''}` === item.id
      ) || [];
      
      const extractedIds: any[] = [];
      draftItemMatches.forEach((di: any) => {
         for (let i=0; i < di.quantity; i++) {
            extractedIds.push({
               imei_1: di.imei_1 || '',
               imei_2: di.imei_2 || '',
               serial_no: di.serial_no || ''
            });
         }
      });

      initialModes[item.id] = Array.from({ length: item.quantity }, (_, i) => {
         const idData = extractedIds[i];
         if (idData?.serial_no) return 'serial';
         if (idData?.imei_1 || idData?.imei_2) return 'imei';
         return defaultMode;
      });

      initialIdentifiers[item.id] = Array.from({ length: item.quantity }, (_, i) => {
         return extractedIds[i] || {
           imei_1: '',
           imei_2: '',
           serial_no: ''
         };
      });
    });

    setItemModes(initialModes);
    setIdentifiers(initialIdentifiers);
  }, [cartItems]);

  const discount = watch('discount') || 0;
  const roundOff = watch('round_off') || 0;
  const finalAmount = Math.max(0, cartTotal - Number(discount) + Number(roundOff));

  const splitTotal = splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const splitOver = splitTotal > finalAmount;
  const remaining = finalAmount - splitTotal;

  const emiSingleDown = watch('emi_down_payment') || 0;
  const emiDownPayment = emiDownPaymentMode === 'Split'
    ? emiDownPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : Number(emiSingleDown);

  const emiTenure = watch('emi_tenure') || 0;

  // Auto calculate loan amount and monthly installments
  useEffect(() => {
    if (paymentType === 'emi') {
      const loan = Math.max(0, finalAmount - Number(emiDownPayment));
      setValue('emi_loan_amount', loan);
      if (!isManualEmi && Number(emiTenure) > 0) {
        setValue('emi_monthly_amount', (loan / Number(emiTenure)).toFixed(2));
      }
    }
  }, [finalAmount, emiDownPayment, emiTenure, paymentType, setValue, isManualEmi]);

  // Customer quick add handler
  const handleQuickAddCustomer = async () => {
    if (!quickCustName.trim()) { toast.error('Customer name is required'); return; }
    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: quickCustName.trim(),
        phone: quickCustPhone.trim() || undefined,
        address: quickCustAddress.trim() || undefined,
      });
      toast.success('Customer added successfully!');
      setSelectedCustomerId(String(newCustomer.id));
      setIsQuickAddOpen(false);
      setQuickCustName(''); setQuickCustPhone(''); setQuickCustAddress('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    }
  };

  // Direct Udhar Guarantor Customer quick add handler
  const handleQuickAddGuarantor = async () => {
    if (!quickGuarantorName.trim()) { toast.error('Guarantor name is required'); return; }
    try {
      setIsSavingGuarantor(true);
      const newCustomer = await createCustomer.mutateAsync({
        name: quickGuarantorName.trim(),
        phone: quickGuarantorPhone.trim() || undefined,
        address: quickGuarantorAddress.trim() || undefined,
      });
      toast.success('Guarantor Customer added successfully!');
      setGuarantorCustomerId(String(newCustomer.id));
      setIsAddingGuarantorCustomer(false);
      setQuickGuarantorName(''); setQuickGuarantorPhone(''); setQuickGuarantorAddress('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    } finally {
      setIsSavingGuarantor(false);
    }
  };

  // Split payments dynamic customer quick add handler
  const handleCreateGuarantor = async (index: number, isDownpayment: boolean) => {
    const name = isDownpayment ? newDownpaymentCustNames[index] : newCustNames[index];
    const phone = isDownpayment ? newDownpaymentCustPhones[index] : newCustPhones[index];
    const address = isDownpayment ? newDownpaymentCustAddresses[index] : newCustAddresses[index];

    if (!name?.trim()) { toast.error('Customer name is required'); return; }

    const setSaving = isDownpayment ? setIsDownpaymentSaving : setIsSaving;
    setSaving(prev => ({ ...prev, [index]: true }));

    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: name.trim(),
        phone: phone?.trim() || undefined,
        address: address?.trim() || undefined,
      });

      toast.success(`Guarantor ${newCustomer.name} added successfully!`);

      if (isDownpayment) {
        const newPayments = [...emiDownPayments];
        newPayments[index].link_customer_id = String(newCustomer.id);
        setEmiDownPayments(newPayments);
        setAddingDownpaymentStates(prev => ({ ...prev, [index]: false }));
        setNewDownpaymentCustNames(prev => ({ ...prev, [index]: '' }));
        setNewDownpaymentCustPhones(prev => ({ ...prev, [index]: '' }));
        setNewDownpaymentCustAddresses(prev => ({ ...prev, [index]: '' }));
      } else {
        const newPayments = [...splitPayments];
        newPayments[index].link_customer_id = String(newCustomer.id);
        setSplitPayments(newPayments);
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

  const onFormError = (errors: any) => {
    console.error("React Hook Form validation errors:", errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      const firstError = errors[firstField] as any;
      toast.error(`Required field missing: ${firstField.replace('emi_', 'EMI ').toUpperCase()}`);
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const onSubmit = async (data: any) => {
    if (!isDrafting.current) {
      if (paymentType === 'emi' && !selectedCustomerId) {
        toast.error('Customer is required for EMI sales'); return;
      }
      if (paymentType === 'udhar' && !selectedCustomerId) {
        toast.error('Customer is required for Credit (Udhar) sales'); return;
      }
  
      // Validate EMI fields
      if (paymentType === 'emi') {
        if (!data.emi_financier) { toast.error('Financier name is required'); return; }
        if (!data.emi_tenure || Number(data.emi_tenure) <= 0) { toast.error('Please enter a valid tenure'); return; }
        if (!data.emi_first_date) { toast.error('First EMI Date is required'); return; }
      }
    }

    // Construct Sale Items Payload (splitting quantity 1 for items with serials/IMEIs)
    const itemsPayload: any[] = [];
    cartItems.forEach(item => {
      const itemIds = identifiers[item.id] || [];
      const hasDetails = itemIds.some(d => d?.imei_1?.trim() || d?.imei_2?.trim() || d?.serial_no?.trim());

      if (hasDetails) {
        itemIds.forEach(d => {
          itemsPayload.push({
            product_id: item.product_id,
            product_batch_id: item.batch_id,
            quantity: 1,
            unit_price: item.unit_price,
            imei_1: d?.imei_1?.trim() || null,
            imei_2: d?.imei_2?.trim() || null,
            serial_no: d?.serial_no?.trim() || null,
          });
        });
      } else {
        itemsPayload.push({
          product_id: item.product_id,
          product_batch_id: item.batch_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        });
      }
    });

    // Construct Payload
    const payload: any = {
      customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
      discount: Number(data.discount || 0),
      round_off: Number(data.round_off || 0),
      date: new Date().toISOString().split('T')[0],
      items: itemsPayload,
    };

    if (paymentType === 'cash') {
      payload.payment_mode = 'Cash';
      payload.payments = [{ payment_mode: 'Cash', amount: finalAmount }];
    } else if (paymentType === 'upi') {
      payload.payment_mode = 'UPI';
      payload.payments = [{ payment_mode: 'UPI', amount: finalAmount }];
    } else if (paymentType === 'debit_card') {
      payload.payment_mode = 'Debit Card';
      payload.payments = [{ payment_mode: 'Debit Card', amount: finalAmount }];
    } else if (paymentType === 'credit_card') {
      payload.payment_mode = 'Credit Card';
      payload.payments = [{ payment_mode: 'Credit Card', amount: finalAmount }];
    } else if (paymentType === 'udhar') {
      payload.payment_mode = 'Udhar';

      const linkageCustomerId = linkGuarantor && guarantorCustomerId ? guarantorCustomerId : selectedCustomerId;
      payload.payments = [{
        payment_mode: 'Udhar',
        amount: finalAmount,
        link_customer_id: Number(linkageCustomerId)
      }];
    } else if (paymentType === 'split') {
      payload.payment_mode = 'Split';

      const hasEmptyUdhar = splitPayments.some(p => p.mode === 'Udhar' && !p.link_customer_id);
      if (hasEmptyUdhar) {
        toast.error('Please select a debtor customer for Udhar credit payments.');
        return;
      }

      payload.payments = splitPayments
        .filter(p => Number(p.amount) > 0)
        .map(p => ({
          payment_mode: p.mode,
          amount: Number(p.amount),
          link_customer_id: p.link_customer_id ? Number(p.link_customer_id) : undefined
        }));

      const totalPaid = payload.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPaid > finalAmount) {
        toast.error('Split payment total exceeds final amount'); return;
      }
      if (totalPaid < finalAmount) {
        toast.error('Split payments must cover the entire final amount'); return;
      }
    } else if (paymentType === 'emi') {
      payload.payment_mode = 'EMI';
      payload.payments = [];

      if (emiDownPaymentMode === 'Split') {
        const hasEmptyUdhar = emiDownPayments.some(p => p.mode === 'Udhar' && !p.link_customer_id);
        if (hasEmptyUdhar) {
          toast.error('Please select a debtor customer for Udhar credit downpayments.');
          return;
        }

        emiDownPayments
          .filter(p => Number(p.amount) > 0)
          .forEach(p => {
            payload.payments.push({
              payment_mode: p.mode,
              amount: Number(p.amount),
              link_customer_id: p.link_customer_id ? Number(p.link_customer_id) : undefined,
              notes: `EMI Down Payment (${p.mode})`
            });
          });
      } else {
        if (emiDownPaymentMode === 'Udhar' && !emiDownPayments[0]?.link_customer_id) {
          toast.error('Please select a debtor customer for Udhar credit downpayments.');
          return;
        }

        if (emiDownPayment > 0)
          payload.payments.push({
            payment_mode: emiDownPaymentMode,
            amount: emiDownPayment,
            link_customer_id: emiDownPaymentMode === 'Udhar' ? (emiDownPayments[0]?.link_customer_id ? Number(emiDownPayments[0].link_customer_id) : undefined) : undefined,
            notes: `EMI Down Payment (${emiDownPaymentMode})`
          });
      }

      payload.emi_detail = {
        financier_name: data.emi_financier,
        down_payment: Number(emiDownPayment),
        loan_amount: Number(data.emi_loan_amount),
        processing_fee: Number(data.emi_processing_fee || 0),
        tenure_months: data.emi_tenure ? Number(data.emi_tenure) : null,
        monthly_installment_amount: data.emi_monthly_amount ? Number(data.emi_monthly_amount) : null,
        first_emi_date: data.emi_first_date || null,
      };
    }

    if (isDrafting.current) {
      payload.status = 'Draft';
      payload.payments = [];
      delete payload.emi_detail;
    }

    try {
      let response;
      if (draftId) {
        response = await updateSale.mutateAsync({ id: draftId, data: payload });
      } else {
        response = await createSale.mutateAsync(payload);
      }
      toast.success(isDrafting.current ? 'Draft saved successfully!' : 'Sale completed successfully!');
      
      const saleId = (response as any)?.data?.id || (response as any)?.id;
      onSuccess(saleId, isDrafting.current);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    }
  };

  const customerOptions = [
    { value: '', label: '— Walk-in Customer —' },
    ...customers.map((c: any) => ({
      value: String(c.id),
      label: c.name,
      description: c.phone ? `📞 ${c.phone}` : 'No phone',
      searchString: `${c.name} ${c.phone || ''} ${c.address || ''}`,
    })),
  ];

  if (initialDraftData?.customer && !customers.some((c: any) => String(c.id) === String(initialDraftData.customer.id))) {
      const c = initialDraftData.customer;
      customerOptions.push({
         value: String(c.id),
         label: c.name,
         description: c.phone ? `📞 ${c.phone}` : 'No phone',
         searchString: `${c.name} ${c.phone || ''} ${c.address || ''}`,
      });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onFormError)} className="flex-1 flex flex-col h-[calc(100vh-56px)] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden animate-in fade-in duration-200">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 relative z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-tight">Billing & Checkout</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">POS Sales Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Total Items:</span>
          <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-500/10 text-primary-500 border border-primary-200/50 dark:border-primary-500/20 px-2 py-0.5 rounded-full">
            {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
          </span>
        </div>
      </div>

      {/* ── Main Content Area (Spacious Split Columns, No Page Scroll on PC) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-4 bg-slate-50 dark:bg-[#0a0a0f] h-auto lg:h-[calc(100vh-100px)]">

        {/* ──── LEFT COLUMN (7/12 Width): Customer & Serial/IMEI details ──── */}
        <div className="w-full lg:w-7/12 lg:overflow-y-auto lg:h-full space-y-4 lg:pr-1.5 custom-scrollbar pb-6">

          {/* 1. Customer Selection Card */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Customer</h3>
                <p className="text-[9px] text-slate-500">Associate this invoice with a customer profile</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(p => !p)}
                className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer ${isQuickAddOpen
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'text-primary-500 border-primary-200 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                  }`}
              >
                {isQuickAddOpen ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                {isQuickAddOpen ? 'Cancel' : 'New Customer'}
              </button>
            </div>

            <SearchableSelect
              value={selectedCustomerId}
              onChange={(val) => setSelectedCustomerId(String(val))}
              options={customerOptions}
              placeholder="Search Customer by Name, Phone, or Address..."
              controlSize="sm"
            />

            {/* Quick Add Form */}
            {isQuickAddOpen && (
              <div className="p-3 bg-primary-50/50 dark:bg-primary-500/5 border border-primary-200/50 dark:border-primary-500/20 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-[9px] font-black uppercase text-primary-600 dark:text-primary-400">Quick Create Profile</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Full Name *"
                    value={quickCustName}
                    onChange={(e) => setQuickCustName(e.target.value)}
                    controlSize="sm"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={quickCustPhone}
                    onChange={(e) => setQuickCustPhone(e.target.value)}
                    controlSize="sm"
                  />
                </div>
                <Input
                  placeholder="Address (Optional)"
                  value={quickCustAddress}
                  onChange={(e) => setQuickCustAddress(e.target.value)}
                  controlSize="sm"
                  className="w-full"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleQuickAddCustomer}
                    disabled={createCustomer.isPending}
                    className="flex items-center gap-1 px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    {createCustomer.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. IMEI & Serial No Identifiers Card */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-3">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Details (IMEI & Serials)</h3>
              <p className="text-[9px] text-slate-500">Provide unique identifiers for warranty and item tracking</p>
            </div>

            <div className="space-y-3">
              {cartItems.map((item) => {
                return (
                  <div key={item.id} className="border border-slate-100 dark:border-white/5 rounded-xl p-3 bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-white/5 pb-1.5">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{item.model_name}</span>
                        <span className="block text-[8px] text-slate-400 font-semibold uppercase mt-0.5">{item.category_name || 'General Product'}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">Qty: {item.quantity}</span>
                    </div>

                    <div className="space-y-2">
                      {Array.from({ length: item.quantity }).map((_, unitIdx) => {
                        const currentMode = itemModes[item.id]?.[unitIdx] || 'serial';

                        return (
                          <div key={unitIdx} className="space-y-1.5 border-b border-dashed border-slate-100 dark:border-white/5 last:border-none pb-1.5 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Unit #{unitIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newModes = { ...itemModes };
                                  newModes[item.id] = [...(newModes[item.id] || [])];
                                  newModes[item.id][unitIdx] = currentMode === 'serial' ? 'imei' : 'serial';
                                  setItemModes(newModes);
                                }}
                                className="text-[9px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
                              >
                                {currentMode === 'serial' ? '+ Add Dual IMEI' : '← Switch to Serial No'}
                              </button>
                            </div>

                            {currentMode === 'serial' ? (
                              <div>
                                <Input
                                  placeholder="Enter Serial Number"
                                  controlSize="sm"
                                  value={identifiers[item.id]?.[unitIdx]?.serial_no || ''}
                                  onChange={(e) => {
                                    const newDetails = [...(identifiers[item.id] || [])];
                                    if (!newDetails[unitIdx]) newDetails[unitIdx] = { imei_1: '', imei_2: '', serial_no: '' };
                                    newDetails[unitIdx].serial_no = e.target.value;
                                    setIdentifiers({ ...identifiers, [item.id]: newDetails });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Enter IMEI 1"
                                  controlSize="sm"
                                  value={identifiers[item.id]?.[unitIdx]?.imei_1 || ''}
                                  onChange={(e) => {
                                    const newDetails = [...(identifiers[item.id] || [])];
                                    if (!newDetails[unitIdx]) newDetails[unitIdx] = { imei_1: '', imei_2: '', serial_no: '' };
                                    newDetails[unitIdx].imei_1 = e.target.value;
                                    setIdentifiers({ ...identifiers, [item.id]: newDetails });
                                  }}
                                />
                                <Input
                                  placeholder="Enter IMEI 2 (Optional)"
                                  controlSize="sm"
                                  value={identifiers[item.id]?.[unitIdx]?.imei_2 || ''}
                                  onChange={(e) => {
                                    const newDetails = [...(identifiers[item.id] || [])];
                                    if (!newDetails[unitIdx]) newDetails[unitIdx] = { imei_1: '', imei_2: '', serial_no: '' };
                                    newDetails[unitIdx].imei_2 = e.target.value;
                                    setIdentifiers({ ...identifiers, [item.id]: newDetails });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ──── RIGHT COLUMN (5/12 Width): Pricing & Payment Selector ──── */}
        <div className="w-full lg:w-5/12 flex flex-col lg:h-full lg:pl-1.5 overflow-visible lg:overflow-hidden">

          {/* Scrollable Form Container with bottom padding */}
          <div className="flex-1 lg:overflow-y-auto space-y-4 lg:pr-1.5 pb-24 lg:pb-48 overflow-x-visible custom-scrollbar">

            {/* 1. Order Totals Card */}
            <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-505">
                  <span className="font-semibold text-slate-500">Cart Subtotal</span>
                  <span className="font-bold text-slate-700 dark:text-white">{formatCurrency(cartTotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Discount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...register('discount', { valueAsNumber: true })}
                      controlSize="sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Round Off (₹)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...register('round_off', { valueAsNumber: true })}
                      controlSize="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-650 dark:text-slate-350">Final Payable Amount:</span>
                <span className="text-lg font-black text-primary-500 font-display">{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            {/* 2. Payment Modes Grid Card */}
            <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4 overflow-visible">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</h3>
                <p className="text-[9px] text-slate-500">Choose how this order is being paid</p>
              </div>

              {/* Main Selector Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cash', label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" /> },
                  { id: 'upi', label: 'UPI', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'debit_card', label: 'Debit Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { id: 'credit_card', label: 'Credit Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { id: 'udhar', label: 'Credit (Udhar)', icon: <IndianRupee className="w-3.5 h-3.5 text-amber-500" /> },
                  { id: 'split', label: 'Split', icon: <GitMerge className="w-3.5 h-3.5 text-primary-500" /> },
                  { id: 'emi', label: 'Finance / EMI', icon: <BarChart2 className="w-3.5 h-3.5 text-emerald-500" /> },
                ].map((mode) => {
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
                            { mode: 'UPI', amount: '' }
                          ]);
                        }
                      }}
                      className={`flex flex-col items-center justify-center gap-1 h-14 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer ${active
                        ? 'bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20 -translate-y-0.5'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/5'
                        }`}
                    >
                      {mode.icon}
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Details Pane based on Payment Type */}
              <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-2xl p-3.5 min-h-[140px] flex flex-col justify-center overflow-visible">

                {/* Cash / UPI / Card Direct */}
                {(paymentType === 'cash' || paymentType === 'upi' || paymentType === 'debit_card' || paymentType === 'credit_card') && (
                  <div className="flex flex-col items-center justify-center text-center gap-2 py-1">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500">
                      {paymentType === 'cash' ? <Banknote className="w-4 h-4" /> : paymentType === 'upi' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Full {paymentType.replace('_', ' ').toUpperCase()} Payment</p>
                      <p className="text-lg font-black text-primary-500 font-display mt-0.5">{formatCurrency(finalAmount)}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Amount will be fully recorded as paid.</p>
                    </div>
                  </div>
                )}

                {/* Direct Credit (Udhar) Mode */}
                {paymentType === 'udhar' && (
                  <div className="space-y-3 overflow-visible">
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                        Credit Sale will post a debt balance of <strong>{formatCurrency(finalAmount)}</strong> to the customer ledger.
                      </div>
                    </div>

                    <div className="space-y-2 overflow-visible">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={linkGuarantor}
                          onChange={(e) => setLinkGuarantor(e.target.checked)}
                          className="w-4 h-4 rounded text-primary-500 border-slate-300"
                        />
                        <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Link debt to a Guarantor customer</span>
                      </label>

                      {linkGuarantor && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-200 overflow-visible">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Guarantor Profile</span>
                            <button
                              type="button"
                              onClick={() => setIsAddingGuarantorCustomer(p => !p)}
                              className="text-[8px] font-bold uppercase text-primary-500 hover:underline cursor-pointer"
                            >
                              {isAddingGuarantorCustomer ? 'Cancel' : '+ New Profile'}
                            </button>
                          </div>

                          <SearchableSelect
                            value={guarantorCustomerId}
                            onChange={(val) => setGuarantorCustomerId(String(val))}
                            options={customerOptions.filter(o => o.value !== '')}
                            placeholder="Search Guarantor..."
                            controlSize="sm"
                          />

                          {isAddingGuarantorCustomer && (
                            <div className="p-2.5 bg-primary-500/5 border border-primary-500/10 rounded-xl space-y-2">
                              <span className="text-[8px] font-black uppercase text-primary-500">Create Guarantor</span>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Name *"
                                  value={quickGuarantorName}
                                  onChange={(e) => setQuickGuarantorName(e.target.value)}
                                  controlSize="sm"
                                />
                                <Input
                                  placeholder="Phone"
                                  value={quickGuarantorPhone}
                                  onChange={(e) => setQuickGuarantorPhone(e.target.value)}
                                  controlSize="sm"
                                />
                              </div>
                              <Input
                                placeholder="Address"
                                value={quickGuarantorAddress}
                                onChange={(e) => setQuickGuarantorAddress(e.target.value)}
                                controlSize="sm"
                                className="w-full"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleQuickAddGuarantor}
                                  disabled={isSavingGuarantor}
                                  className="px-3 py-1 bg-primary-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg"
                                >
                                  {isSavingGuarantor ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Split Payments Mode */}
                {paymentType === 'split' && (
                  <div className="space-y-3 w-full overflow-visible">
                    <div className="space-y-2 overflow-visible">
                      {splitPayments.map((payment, index) => (
                        <div key={index} className="space-y-1.5 p-2 bg-white dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-xl animate-in fade-in duration-200 overflow-visible">
                          <div className="flex items-center gap-1.5 group">
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
                                  { value: 'UPI', label: 'UPI' },
                                  { value: 'Card', label: 'Card' },
                                  { value: 'Net Banking', label: 'Net Banking' },
                                  { value: 'Udhar', label: 'Udhar (Credit)' },
                                ]}
                              />
                            </div>
                            <div className="flex-1 relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                              <Input
                                type="number"
                                value={payment.amount}
                                onChange={(e) => {
                                  const newPayments = [...splitPayments];
                                  newPayments[index].amount = e.target.value;
                                  setSplitPayments(newPayments);
                                }}
                                placeholder="0.00"
                                controlSize="sm"
                                className="pl-5 bg-slate-50 dark:bg-[#0c0c0f]"
                              />
                            </div>
                            {splitPayments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPayments = splitPayments.filter((_, i) => i !== index);
                                  setSplitPayments(newPayments);
                                }}
                                className="h-8 w-8 flex items-center justify-center border border-rose-200 dark:border-rose-500/15 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {payment.mode === 'Udhar' && (
                            <div className="w-full space-y-1 animate-in fade-in duration-200 overflow-visible">
                              {!addingStates[index] ? (
                                <div className="space-y-1 overflow-visible">
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
                                      className="text-[8px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer py-0.5"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>Create New Customer</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2 bg-primary-500/5 border border-primary-500/15 rounded-lg space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <Input
                                      placeholder="Name *"
                                      value={newCustNames[index] || ''}
                                      onChange={(e) => {
                                        setNewCustNames(prev => ({ ...prev, [index]: e.target.value }));
                                      }}
                                      controlSize="sm"
                                    />
                                    <Input
                                      placeholder="Phone"
                                      value={newCustPhones[index] || ''}
                                      onChange={(e) => {
                                        setNewCustPhones(prev => ({ ...prev, [index]: e.target.value }));
                                      }}
                                      controlSize="sm"
                                    />
                                  </div>
                                  <Input
                                    placeholder="Address (Optional)"
                                    value={newCustAddresses[index] || ''}
                                    onChange={(e) => {
                                      setNewCustAddresses(prev => ({ ...prev, [index]: e.target.value }));
                                    }}
                                    controlSize="sm"
                                    className="w-full"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddingStates(prev => ({ ...prev, [index]: false }));
                                      }}
                                      className="px-2 py-0.5 text-[8px] font-bold text-slate-500 hover:text-slate-700 uppercase"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSaving[index]}
                                      onClick={() => handleCreateGuarantor(index, false)}
                                      className="px-2.5 py-0.5 bg-primary-500 text-white text-[8px] font-black rounded uppercase tracking-wider disabled:opacity-50"
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
                      className="flex items-center justify-center gap-1.5 w-full h-8 border border-dashed border-primary-300 dark:border-primary-500/20 hover:border-primary-500 text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Payment Mode</span>
                    </button>

                    <div className={`pt-2 border-t space-y-1.5 ${splitOver ? 'border-rose-200 dark:border-rose-500/20' : 'border-slate-100 dark:border-white/5'}`}>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-500">Total split:</span>
                        <span className={`font-black font-display ${splitOver ? 'text-rose-500' : 'text-primary-500'}`}>
                          {formatCurrency(splitTotal)}
                          {splitOver && <span className="text-[8px] ml-1 text-rose-400">(over!)</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-500">Remaining to split:</span>
                        <span className={`font-black font-display ${remaining > 0 ? 'text-amber-500' : remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {remaining < 0 ? `Overpaid by ${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Finance / EMI Mode */}
                {paymentType === 'emi' && (
                  <div className="space-y-3 w-full overflow-visible">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Financier Name *</label>
                      <Input
                        list="financiers"
                        {...register('emi_financier', { required: paymentType === 'emi' })}
                        placeholder="e.g. Bajaj Finserv"
                        controlSize="sm"
                      />
                      <datalist id="financiers">
                        {COMMON_FINANCIERS.map(f => <option key={f} value={f} />)}
                      </datalist>
                    </div>

                    <div className="space-y-2 border border-slate-100 dark:border-white/5 rounded-xl p-2.5 bg-white dark:bg-white/[0.01] overflow-visible">
                      <div className="flex items-end gap-2 w-full overflow-visible">
                        <div className="flex-1 min-w-[110px] overflow-visible">
                          <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Down Pmt Mode</label>
                          <CustomSelect
                            value={emiDownPaymentMode || 'Cash'}
                            onChange={(value) => {
                              setEmiDownPaymentMode(value);
                              if (value === 'Split' && emiDownPayments.length < 2) {
                                setEmiDownPayments([
                                  { mode: 'Cash', amount: '' },
                                  { mode: 'UPI', amount: '' }
                                ]);
                              }
                            }}
                            options={[
                              { value: 'Cash', label: 'Cash' },
                              { value: 'UPI', label: 'UPI' },
                              { value: 'Card', label: 'Card' },
                              { value: 'Net Banking', label: 'Net Banking' },
                              { value: 'Udhar', label: 'Udhar (Credit)' },
                              { value: 'Split', label: 'Split Payment' },
                            ]}
                          />
                        </div>
                        {emiDownPaymentMode !== 'Split' && (
                          <div className="flex-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Down Pmt (₹)</label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                              <Input type="number" {...register('emi_down_payment')} placeholder="0.00" controlSize="sm" className="pl-5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {emiDownPaymentMode === 'Udhar' && (
                        <div className="w-full space-y-1 animate-in fade-in duration-200 overflow-visible">
                          {!addingDownpaymentStates[0] ? (
                            <div className="space-y-1 overflow-visible">
                              <CustomSelect
                                value={emiDownPayments[0]?.link_customer_id || ''}
                                onChange={(value) => {
                                  const newPayments = [...emiDownPayments];
                                  if (!newPayments[0]) newPayments[0] = { mode: 'Udhar', amount: '' };
                                  newPayments[0].link_customer_id = value;
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
                                    setAddingDownpaymentStates(prev => ({ ...prev, [0]: true }));
                                  }}
                                  className="text-[8px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer py-0.5"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Create New Customer</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 bg-primary-500/5 border border-primary-500/10 rounded-xl space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                              <div className="grid grid-cols-2 gap-1.5">
                                <Input
                                  placeholder="Name *"
                                  value={newDownpaymentCustNames[0] || ''}
                                  onChange={(e) => {
                                    setNewDownpaymentCustNames(prev => ({ ...prev, [0]: e.target.value }));
                                  }}
                                  controlSize="sm"
                                />
                                <Input
                                  placeholder="Phone"
                                  value={newDownpaymentCustPhones[0] || ''}
                                  onChange={(e) => {
                                    setNewDownpaymentCustPhones(prev => ({ ...prev, [0]: e.target.value }));
                                  }}
                                  controlSize="sm"
                                />
                              </div>
                              <Input
                                placeholder="Address (Optional)"
                                value={newDownpaymentCustAddresses[0] || ''}
                                onChange={(e) => {
                                  setNewDownpaymentCustAddresses(prev => ({ ...prev, [0]: e.target.value }));
                                }}
                                controlSize="sm"
                                className="w-full"
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingDownpaymentStates(prev => ({ ...prev, [0]: false }));
                                  }}
                                  className="px-2 py-0.5 text-[8px] font-bold text-slate-500 hover:text-slate-700 uppercase"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isDownpaymentSaving[0]}
                                  onClick={() => handleCreateGuarantor(0, true)}
                                  className="px-2.5 py-0.5 bg-primary-500 text-white text-[8px] font-black rounded uppercase tracking-wider disabled:opacity-50"
                                >
                                  {isDownpaymentSaving[0] ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {emiDownPaymentMode === 'Split' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5 overflow-visible">
                          <div className="space-y-2 overflow-visible">
                            {emiDownPayments.map((payment, index) => (
                              <div key={index} className="space-y-1.5 p-2 bg-white dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/[0.05] rounded-xl animate-in fade-in duration-200 overflow-visible">
                                <div className="flex items-center gap-1.5 group">
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
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                                    <Input
                                      type="number"
                                      value={payment.amount}
                                      onChange={(e) => {
                                        const newPayments = [...emiDownPayments];
                                        newPayments[index].amount = e.target.value;
                                        setEmiDownPayments(newPayments);
                                      }}
                                      placeholder="0.00"
                                      controlSize="sm"
                                      className="pl-5 bg-slate-50 dark:bg-[#0c0c0f]"
                                    />
                                  </div>
                                  {emiDownPayments.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPayments = emiDownPayments.filter((_, i) => i !== index);
                                        setEmiDownPayments(newPayments);
                                      }}
                                      className="h-8 w-8 flex items-center justify-center border border-rose-200 dark:border-rose-500/15 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                {payment.mode === 'Udhar' && (
                                  <div className="w-full space-y-1 animate-in fade-in duration-200 overflow-visible">
                                    {!addingDownpaymentStates[index] ? (
                                      <div className="space-y-1 overflow-visible">
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
                                            className="text-[8px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer py-0.5"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                            <span>Create New Customer</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-2 bg-primary-500/5 border border-primary-500/10 rounded-xl space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <Input
                                            placeholder="Name *"
                                            value={newDownpaymentCustNames[index] || ''}
                                            onChange={(e) => {
                                              setNewDownpaymentCustNames(prev => ({ ...prev, [index]: e.target.value }));
                                            }}
                                            controlSize="sm"
                                          />
                                          <Input
                                            placeholder="Phone"
                                            value={newDownpaymentCustPhones[index] || ''}
                                            onChange={(e) => {
                                              setNewDownpaymentCustPhones(prev => ({ ...prev, [index]: e.target.value }));
                                            }}
                                            controlSize="sm"
                                          />
                                        </div>
                                        <Input
                                          placeholder="Address (Optional)"
                                          value={newDownpaymentCustAddresses[index] || ''}
                                          onChange={(e) => {
                                            setNewDownpaymentCustAddresses(prev => ({ ...prev, [index]: e.target.value }));
                                          }}
                                          controlSize="sm"
                                          className="w-full"
                                        />
                                        <div className="flex justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setAddingDownpaymentStates(prev => ({ ...prev, [index]: false }));
                                            }}
                                            className="px-2 py-0.5 text-[8px] font-bold text-slate-500 hover:text-slate-700 uppercase"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isDownpaymentSaving[index]}
                                            onClick={() => handleCreateGuarantor(index, true)}
                                            className="px-2.5 py-0.5 bg-primary-500 text-white text-[8px] font-black rounded uppercase tracking-wider disabled:opacity-50"
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
                            className="flex items-center justify-center gap-1.5 w-full h-8 border border-dashed border-primary-300 dark:border-primary-500/20 hover:border-primary-500 text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Downpayment Mode</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Loan Amount</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                          <Input type="number" {...register('emi_loan_amount')} readOnly className="pl-5 bg-slate-100 dark:bg-white/5 font-bold text-slate-800 dark:text-white" controlSize="sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Tenure (Months)</label>
                        <Input type="number" {...register('emi_tenure')} placeholder="e.g. 6" controlSize="sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Processing Fee (₹)</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                          <Input type="number" {...register('emi_processing_fee')} placeholder="0.00" controlSize="sm" className="pl-5" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Monthly EMI</label>
                          {isManualEmi && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsManualEmi(false);
                                const loan = Math.max(0, finalAmount - Number(emiDownPayment));
                                if (Number(emiTenure) > 0) {
                                  setValue('emi_monthly_amount', (loan / Number(emiTenure)).toFixed(2));
                                }
                              }}
                              className="text-[7px] font-black uppercase text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              🔄 Reset
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            {...register('emi_monthly_amount')}
                            onChange={(e: any) => {
                              register('emi_monthly_amount').onChange(e);
                              setIsManualEmi(true);
                            }}
                            placeholder="Auto"
                            controlSize="sm"
                            className="pl-5 font-bold text-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">EMI Date</label>
                        <DatePicker
                          value={watch('emi_first_date')}
                          onChange={(val) => setValue('emi_first_date', val)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div> {/* end of scrollable form container */}
        </div>

      </div>

      {/* 3. Sticky Action Buttons Card (Fixed at the bottom, Full Width) */}
      <div className="flex items-center justify-end gap-2 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#111118] shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-none relative z-30">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="h-10 flex-1 lg:flex-none lg:px-8 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </Button>
        <button
          type="submit"
          onClick={() => { isDrafting.current = true; }}
          disabled={isSubmitting}
          className="h-10 flex-1 lg:flex-none lg:px-8 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg transition-all duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
        >
          Save Draft
        </button>
        <button
          type="submit"
          onClick={() => { isDrafting.current = false; }}
          disabled={isSubmitting || splitOver}
          className="h-10 flex-[1.5] lg:flex-none lg:px-10 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-1 sm:gap-2"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Processing…' : 'Complete'}</span>
        </button>
      </div>

    </form>
  );
}
