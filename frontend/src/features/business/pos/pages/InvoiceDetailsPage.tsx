import { useParams, useNavigate } from 'react-router-dom';
import { useSale } from '../api/useSales';
import { Button } from '@/components/ui/button';
import { FileText, Printer, ArrowLeft, Edit3, User, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useTenantStore } from '@/store/tenantStore';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { useState } from 'react';
import { InvoiceHeader } from '../components/invoice/InvoiceHeader';
import { InvoiceItemsTable } from '../components/invoice/InvoiceItemsTable';
import { InvoiceTotals } from '../components/invoice/InvoiceTotals';
import api from '@/lib/api';
import { toast } from 'sonner';

function InvoiceDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-6">
        <CardSkeleton count={1} />
        <div className="bg-white dark:bg-[#111118] rounded-2xl p-6 mt-6 border border-slate-200 dark:border-white/5">
          <table className="w-full">
            <tbody>
              <TableSkeleton cols={4} rows={3} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const getGuarantorInfo = (notes?: string) => {
  if (!notes) return null;
  const match = notes.match(/Udhar linked to Customer:\s*([^(|]+)(?:\(ID:\s*(\d+)\))?/i);
  if (match) {
    return {
      name: match[1].trim(),
      id: match[2] ? match[2].trim() : null
    };
  }
  return null;
};

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sale, isLoading } = useSale(Number(id));
  const { activeBusiness } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'receipt'>('overview');
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) return <InvoiceDetailsSkeleton />;
  if (!sale) return <div className="p-8 text-center text-rose-500 font-bold text-xl">Invoice not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!sale?.customer?.phone) {
      toast.error("Customer does not have a phone number saved.");
      return;
    }

    let template = activeBusiness?.settings?.whatsapp_invoice_template || 
      "Hello *[Customer Name]*,\n\nThank you for shopping with us! Your invoice *[Invoice Number]* for Rs.*[Amount]* has been generated.\n\nView or download your invoice here:\n[Invoice Link]\n\nRegards,\n*[Business Name]*";

    const invoiceLink = `${window.location.origin}/invoices/${sale.id}`; 

    const message = template
      .replace(/\[Customer Name\]/g, sale.customer.name)
      .replace(/\[Invoice Number\]/g, sale.invoice_number)
      .replace(/\[Amount\]/g, formatCurrency(sale.final_amount).toString())
      .replace(/\[Invoice Link\]/g, invoiceLink)
      .replace(/\[Business Name\]/g, activeBusiness?.name || 'Our Store');

    let phone = sale.customer.phone.replace(/\D/g, ''); 
    if (phone.length === 10) phone = '91' + phone;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPdf = async (withLetterhead: boolean) => {
    try {
      setIsDownloading(true);
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      
      const response = await api.get(`/business/sales/${sale.id}/invoice-pdf?header=${withLetterhead}&footer=${withLetterhead}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${sale.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF downloaded successfully', { id: 'pdf-download' });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to generate PDF invoice', { id: 'pdf-download' });
    } finally {
      setIsDownloading(false);
    }
  };

  const isEmiPaid = sale?.emiDetail?.installments?.some((inst: any) => inst.status === 'paid');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-200 print:bg-white print:min-h-0">
      
      {/* Premium Hero Banner (Hidden when printing) */}
      <div className="print:hidden relative pt-8 pb-20 px-6 sm:px-8 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 overflow-hidden">
        {/* Animated Shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-float2 pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              <button onClick={() => navigate('/invoices')} className="hover:text-primary-500 transition-colors">Invoices</button>
              <span>/</span>
              <span className="text-primary-500">{sale.invoice_number}</span>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  Invoice {sale.invoice_number}
                </h1>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Generated on {new Date(sale.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-2 h-10 px-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button 
              onClick={() => navigate(`/pos?edit_id=${sale.id}`)}
              className="flex items-center gap-2 h-10 px-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button 
              onClick={() => handleWhatsAppShare()}
              className="flex items-center gap-2 h-10 px-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-green-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Share WhatsApp
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
              title="Prints receipt using your browser print settings. Best for thermal printers."
            >
              🖨️ Thermal Receipt
            </button>
            <button 
              onClick={() => handleDownloadPdf(true)}
              className="flex items-center gap-2 h-10 px-4 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
              title="Downloads A4 PDF with your uploaded Header & Footer images."
            >
              📄 A4 (With Letterhead)
            </button>
            <button 
              onClick={() => handleDownloadPdf(false)}
              className="flex items-center gap-2 h-10 px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
              title="Downloads standard A4 PDF without Letterhead design."
            >
              📄 A4 (Plain)
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 print:p-0 print:m-0 print:max-w-none relative z-20">
        
        {/* Tabs - Hidden when printing */}
        <div className="print:hidden flex items-center bg-white dark:bg-[#111118] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 w-fit -mt-12 shadow-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === 'receipt' 
                ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            Printable Receipt
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="print:hidden space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Summary Card */}
              <div className="lg:col-span-2 bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Financial Summary</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white font-display">{formatCurrency(sale.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Discount</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white font-display">{formatCurrency(sale.discount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1">Final Amount</p>
                      <p className="text-2xl font-black text-primary-600 dark:text-primary-400 font-display">{formatCurrency(sale.final_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Paid Amount</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">{formatCurrency(sale.paid_amount)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Purchased Items</h4>
                    <span className="text-[10px] font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                      {sale.items?.length || 0} Items
                    </span>
                  </div>
                  
                  <div className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Item</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Qty</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Price</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {sale.items?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{item.product?.model_name || 'Unknown Product'}</p>
                              {item.batch && <p className="text-[10px] font-bold text-slate-400 mt-0.5">Batch: {item.batch.batch_number}</p>}
                              {item.imei_1 && (
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                  IMEI 1: {item.imei_1} {item.imei_2 ? `| IMEI 2: ${item.imei_2}` : ''}
                                </p>
                              )}
                              {item.serial_no && <p className="text-[10px] font-bold text-slate-400 mt-0.5">Serial: {item.serial_no}</p>}
                            </td>
                            <td className="px-4 py-3.5 text-right font-semibold text-slate-600 dark:text-slate-400">{item.quantity}</td>
                            <td className="px-4 py-3.5 text-right font-semibold text-slate-600 dark:text-slate-400">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-3.5 text-right font-black text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Side Cards */}
              <div className="space-y-6">
                
                {/* Customer Info */}
                <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-500" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Customer Details</h3>
                  </div>
                  
                  {sale.customer ? (
                    <div>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{sale.customer.name}</p>
                      <p className="text-slate-500 font-medium text-sm mt-1 mb-4">{sale.customer.phone || 'No phone provided'}</p>
                      <button 
                        className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        onClick={() => navigate(`/customers/${sale.customer.id}`)}
                      >
                        View Full Profile →
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-20 text-sm font-bold text-slate-400 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                      Walk-in Customer
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 p-6 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Payments</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {sale.payments?.map((payment: any) => {
                      const guarantor = getGuarantorInfo(payment.notes);
                      const displayNotes = payment.notes 
                        ? payment.notes.replace(/Udhar linked to Customer:[^|]*/i, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim()
                        : '';
                      return (
                        <div key={payment.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{payment.payment_mode}</p>
                            {displayNotes && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{displayNotes}</p>}
                            {guarantor && (
                              <div className="mt-1 flex items-center gap-1">
                                {guarantor.id ? (
                                  <button
                                    onClick={() => navigate(`/customers/${guarantor.id}`)}
                                    className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-md border border-rose-100 dark:border-rose-500/20 transition-all cursor-pointer flex items-center gap-0.5"
                                  >
                                    Debtor/Guarantor: {guarantor.name} →
                                  </button>
                                ) : (
                                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-md border border-rose-100 dark:border-rose-500/20">
                                    Debtor/Guarantor: {guarantor.name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(payment.amount)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {sale.emiDetail && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">EMI Finance</p>
                      <p className="font-black text-slate-900 dark:text-white tracking-tight">{sale.emiDetail.financier_name}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-500/20">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Loan Amount</p>
                        <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">{formatCurrency(sale.emiDetail.loan_amount)}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tenure</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{sale.emiDetail.tenure_months} months</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl print:shadow-none print:border-none print:rounded-none animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
            <InvoiceHeader sale={sale} activeBusiness={activeBusiness} />
            
            <InvoiceItemsTable items={sale.items || []} />
            
            <InvoiceTotals sale={sale} />

            {/* Payments Section in Receipt */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Payment Details</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sale.payments?.map((payment: any) => {
                    const guarantor = getGuarantorInfo(payment.notes);
                    const displayNotes = payment.notes 
                      ? payment.notes.replace(/Udhar linked to Customer:[^|]*/i, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim()
                      : '';
                    return (
                      <div key={payment.id} className="bg-white dark:bg-slate-900/50 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{payment.payment_mode}</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(payment.amount)}</p>
                        {displayNotes && <p className="text-[10px] font-medium text-slate-500 mt-1">{displayNotes}</p>}
                        {guarantor && (
                          guarantor.id ? (
                            <button
                              onClick={() => navigate(`/customers/${guarantor.id}`)}
                              className="text-[10px] font-black text-rose-500 mt-1.5 uppercase tracking-wider hover:text-rose-600 transition-colors cursor-pointer text-left block"
                            >
                              Guarantor: {guarantor.name} →
                            </button>
                          ) : (
                            <p className="text-[10px] font-black text-rose-500 mt-1.5 uppercase tracking-wider">
                              Guarantor: {guarantor.name}
                            </p>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>

                {sale.emiDetail && (
                  <div className="bg-indigo-50/80 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/50 px-4 py-3 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 mb-2 tracking-tight">
                      Finance Details - {sale.emiDetail.financier_name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70 mb-1">Down Payment</p>
                        <p className="font-black text-indigo-900 dark:text-indigo-300">{formatCurrency(sale.emiDetail.down_payment)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70 mb-1">Loan Amount</p>
                        <p className="font-black text-indigo-900 dark:text-indigo-300">{formatCurrency(sale.emiDetail.loan_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70 mb-1">Processing Fee</p>
                        <p className="font-black text-indigo-900 dark:text-indigo-300">{formatCurrency(sale.emiDetail.processing_fee)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70 mb-1">Tenure</p>
                        <p className="font-black text-indigo-900 dark:text-indigo-300">{sale.emiDetail.tenure_months || 'N/A'} Months</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-black/20">
              Thank you for your business!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
