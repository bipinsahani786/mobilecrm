import { useNavigate, useParams } from 'react-router-dom';
import { CornerDownLeft, ArrowLeft, ArrowRight, User, Receipt, Clock, Package, Tag, Hash, Phone, FileText } from 'lucide-react';
import { useSaleReturn } from '../api/useSaleReturns';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

const typeConfig: Record<string, { label: string; badgeCls: string; bannerCls: string; dotCls: string }> = {
  refund: { 
    label: 'Refund (Cash/UPI)', 
    badgeCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30',
    bannerCls: 'from-rose-500/10 to-rose-500/5 border-rose-200/60 dark:border-rose-500/20',
    dotCls: 'bg-rose-500'
  },
};

export default function SaleReturnDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: saleReturn, isLoading } = useSaleReturn(Number(id));

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="w-full h-24 rounded-2xl" />
        <Skeleton className="w-full h-64 rounded-2xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
      </div>
    </div>
  );
  if (!saleReturn) return <div className="p-8 text-center text-slate-500">Return not found</div>;

  const cfg = typeConfig[saleReturn.refund_type] || typeConfig.refund;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/sale-returns')}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        >
          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </span>
          <span className="hidden sm:block">Back to Returns</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
            {cfg.label}
          </div>
          <div className="text-xs font-black text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg">
            #{saleReturn.return_number}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">

        {/* Invoice Link Banner */}
        <div className={`bg-gradient-to-r ${cfg.bannerCls} border rounded-2xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/50 dark:bg-white/10 rounded-xl">
              <Receipt className="w-5 h-5" style={{ color: cfg.dotCls.replace('bg-', 'var(--') + ')' }} />
            </div>
            <div>
              <div className="text-sm font-black text-slate-800 dark:text-white">Original Invoice</div>
              <div className="text-xs text-slate-500">View the original invoice for this return</div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/invoices/${saleReturn.sale_id}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            <ArrowRight className="w-4 h-4" /> View Invoice
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Customer Row */}
          <div className="p-5 flex items-center gap-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Customer</div>
              <div className="text-base font-black text-slate-900 dark:text-white truncate">{saleReturn.customer?.name || 'Walk-in Customer'}</div>
              {saleReturn.customer?.phone && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {saleReturn.customer.phone}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Return ID</div>
              <div className="flex items-center gap-1 text-xs font-black text-primary-600 dark:text-primary-400">
                <Hash className="w-3 h-3" />{saleReturn.return_number}
              </div>
            </div>
          </div>

          {/* Returned Items */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Returned Products</span>
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {(saleReturn.items || []).length} item{(saleReturn.items || []).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {(saleReturn.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{item.product?.model_name || 'Item'}</div>
                      <div className="text-xs text-slate-500">
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.return_amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates & Status */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Return Date</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">
                  {new Date(saleReturn.return_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                <div className="text-sm font-bold text-emerald-600 capitalize">
                  {saleReturn.status}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="p-5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Refund Amount</span>
            </div>
            <div className="text-2xl font-black text-primary-600 dark:text-primary-400">
              {formatCurrency(saleReturn.total_return_amount)}
            </div>
          </div>
        </div>

        {/* Reason and Notes */}
        {(saleReturn.reason || saleReturn.notes) && (
          <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm p-5 space-y-4">
            {saleReturn.reason && (
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Return</div>
                <div className="text-sm text-slate-800 dark:text-white font-medium">{saleReturn.reason}</div>
              </div>
            )}
            {saleReturn.notes && (
              <div className={saleReturn.reason ? 'pt-4 border-t border-slate-100 dark:border-white/5' : ''}>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Additional Notes</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{saleReturn.notes}</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
