import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, FileText, User, Calendar, Package, ChevronRight } from 'lucide-react';
import { useQuotation, useConvertToBill } from '../api/useQuotations';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import api from '@/lib/api';

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  sent: { label: 'Sent', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  rejected: { label: 'Rejected', cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
  converted: { label: 'Converted to Bill', cls: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400' },
};

export default function QuotationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useQuotation(Number(id));
  const convertMutation = useConvertToBill();

  const handleDownloadPdf = async (withLetterhead: boolean) => {
    if (!quotation) return;
    try {
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      const res = await api.get(`/business/quotations/${quotation.id}/pdf?header=${withLetterhead}&footer=${withLetterhead}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${quotation.quotation_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded', { id: 'pdf-download' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf-download' });
    }
  };

  const handleConvertToBill = () => {
    if (!quotation) return;
    navigate(`/pos?quotation_id=${quotation.id}`);
  };

  if (isLoading || !quotation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full" />
      </div>
    );
  }

  const cfg = statusConfig[quotation.status] || statusConfig.draft;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Back & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onClick={() => navigate('/quotations')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Quotations
          </button>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => handleDownloadPdf(true)}
              className="flex items-center gap-2 h-10 px-5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-primary-500/20">
              <Download className="w-3.5 h-3.5" /> With Letterhead
            </button>
            <button onClick={() => handleDownloadPdf(false)}
              className="flex items-center gap-2 h-10 px-5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md">
              <Download className="w-3.5 h-3.5" /> Without Letterhead
            </button>
            {quotation.status !== 'converted' && (
              <button onClick={handleConvertToBill} disabled={convertMutation.isPending}
                className="flex items-center gap-2 h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50">
                <TrendingUp className="w-3.5 h-3.5" /> Convert to Bill
              </button>
            )}
          </div>
        </div>

        {/* Quotation Header Card */}
        <div className="bg-white dark:bg-[#111118] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden">
          {/* Title Banner */}
          <div className="bg-primary-500 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-100 mb-1">Quotation</p>
                <h1 className="text-2xl font-black text-white">{quotation.quotation_number}</h1>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${cfg.cls}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary-500" />
                {quotation.customer?.name || 'Walk-in Customer'}
              </p>
              {quotation.customer?.phone && (
                <p className="text-[10px] text-slate-400 mt-0.5">{quotation.customer.phone}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                {new Date(quotation.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Valid Until</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
              <p className="text-xl font-black text-primary-500">
                {formatCurrency(quotation.final_amount)}
              </p>
            </div>
          </div>

          {/* Converted Sale Link */}
          {quotation.status === 'converted' && quotation.converted_sale_id && (
            <div className="mx-6 mb-4 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400">Converted to Invoice</p>
                <p className="text-sm font-black text-primary-700 dark:text-primary-300 mt-0.5">
                  Invoice #{quotation.convertedSale?.invoice_number || quotation.converted_sale_id}
                </p>
              </div>
              <button onClick={() => navigate(`/invoices/${quotation.converted_sale_id}`)}
                className="flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline">
                View Invoice <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="bg-white dark:bg-[#111118] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-500" /> Items ({quotation.items?.length || 0})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.02]">
                  <th className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">#</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                  <th className="text-right px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Qty</th>
                  <th className="text-right px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Rate</th>
                  <th className="text-right px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items?.map((item: any, idx: number) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{item.product?.model_name}</p>
                      {item.product?.brand && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.product.brand.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.unit_price)}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(quotation.total_amount)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-rose-500">Discount</span>
                  <span className="font-bold text-rose-500">- {formatCurrency(quotation.discount)}</span>
                </div>
              )}
              {quotation.round_off !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">Round Off</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(quotation.round_off)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="font-black text-slate-900 dark:text-white">Total</span>
                <span className="font-black text-primary-500">{formatCurrency(quotation.final_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="bg-white dark:bg-[#111118] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Notes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{quotation.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
