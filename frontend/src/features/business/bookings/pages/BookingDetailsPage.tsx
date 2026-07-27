import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, ArrowLeft, ArrowRight, XCircle, Package, User, 
  CreditCard, Clock, CheckCircle2, Tag, IndianRupee, Phone, Hash, Download
} from 'lucide-react';
import { useBooking, useCancelBooking, downloadBookingPdf } from '../api/useBookings';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState } from 'react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';

const statusConfig: Record<string, { label: string; badgeCls: string; bannerCls: string; dotCls: string }> = {
  booked: { 
    label: 'Booked', 
    badgeCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30',
    bannerCls: 'from-amber-500/10 to-amber-500/5 border-amber-200/60 dark:border-amber-500/20',
    dotCls: 'bg-amber-500'
  },
  converted_to_sale: { 
    label: 'Converted to Sale', 
    badgeCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
    bannerCls: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200/60 dark:border-emerald-500/20',
    dotCls: 'bg-emerald-500'
  },
  converted: { 
    label: 'Converted to Sale', 
    badgeCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
    bannerCls: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200/60 dark:border-emerald-500/20',
    dotCls: 'bg-emerald-500'
  },
  cancelled: { 
    label: 'Cancelled', 
    badgeCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30',
    bannerCls: 'from-rose-500/10 to-rose-500/5 border-rose-200/60 dark:border-rose-500/20',
    dotCls: 'bg-rose-500'
  },
  expired: { 
    label: 'Expired', 
    badgeCls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    bannerCls: 'from-slate-500/10 to-slate-500/5 border-slate-200/60 dark:border-slate-700',
    dotCls: 'bg-slate-400'
  },
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useBooking(Number(id));
  const cancelMutation = useCancelBooking();
  const [showCancel, setShowCancel] = useState(false);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="w-full h-24 rounded-2xl" />
        <Skeleton className="w-full h-64 rounded-2xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
      </div>
    </div>
  );
  if (!booking) return <div className="p-8 text-center text-slate-500">Booking not found</div>;

  const cfg = statusConfig[booking.status] || statusConfig.booked;
  const remainingAmount = booking.total_amount - (booking.advance_amount || booking.advance_paid || 0);
  const advancePaid = booking.advance_amount || booking.advance_paid || 0;

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id: booking.id });
      toast.success('Booking cancelled');
      setShowCancel(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleConvertToSale = () => {
    navigate(`/pos?booking_id=${booking.id}`);
  };

  const handleDownloadPdf = async () => {
    const downloadPromise = async () => {
      const response = await downloadBookingPdf(booking.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking-${booking.booking_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    };

    toast.promise(downloadPromise(), {
      loading: 'Generating PDF...',
      success: 'PDF downloaded successfully!',
      error: 'Failed to download booking PDF',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        >
          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </span>
          <span className="hidden sm:block">Back to Bookings</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dotCls}`} />
            {cfg.label}
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-white/5"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <div className="text-xs font-black text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg">
            #{booking.booking_number}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">

        {/* Action Banner (only for active bookings) */}
        {booking.status === 'booked' && (
          <div className={`bg-gradient-to-r ${cfg.bannerCls} border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-500/15 rounded-xl">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-800 dark:text-white">Active Booking</div>
                <div className="text-xs text-slate-500">Convert to a sale or cancel this booking</div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleConvertToSale}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="w-4 h-4" />
                Convert to Sale
              </button>
              <button
                onClick={() => setShowCancel(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-xl font-bold text-sm transition-all"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Converted sale link */}
        {(booking.status === 'converted' || booking.status === 'converted_to_sale') && booking.converted_sale_id && (
          <div className={`bg-gradient-to-r ${cfg.bannerCls} border rounded-2xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/15 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-800 dark:text-white">Converted to Sale</div>
                <div className="text-xs text-slate-500">This booking has been converted to an invoice</div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/invoices/${booking.converted_sale_id}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              <ArrowRight className="w-4 h-4" /> View Invoice
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Customer Row */}
          <div className="p-5 flex items-center gap-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Customer</div>
              <div className="text-base font-black text-slate-900 dark:text-white truncate">{booking.customer?.name || 'N/A'}</div>
              {booking.customer?.phone && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {booking.customer.phone}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Booking ID</div>
              <div className="flex items-center gap-1 text-xs font-black text-primary-600 dark:text-primary-400">
                <Hash className="w-3 h-3" />{booking.booking_number}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Products</span>
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {(booking.items || []).length} item{(booking.items || []).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {(booking.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{item.product?.model_name || 'N/A'}</div>
                      {item.product?.brand && <div className="text-xs text-slate-400">{item.product.brand.name}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.unit_price * item.quantity)}</div>
                    <div className="text-xs text-slate-400">{item.quantity} × {formatCurrency(item.unit_price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Details</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-black text-slate-900 dark:text-white">{formatCurrency(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <IndianRupee className="w-3 h-3" /> Advance Paid
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(advancePaid)}</span>
              </div>
              {booking.payments && booking.payments.length > 0 && (
                <div className="flex justify-between items-start text-xs text-slate-400">
                  <span>Payment Mode</span>
                  <div className="flex flex-col items-end gap-1">
                    {booking.payments.map((p: any, idx: number) => (
                      <span key={idx} className="font-bold uppercase">
                        {p.payment_mode} {booking.payments.length > 1 ? `(${formatCurrency(p.amount)})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-white/5 pt-2.5 flex justify-between items-center">
                <span className="font-black text-sm text-slate-700 dark:text-slate-200">Remaining Payable</span>
                <span className={`font-black text-lg ${remainingAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking Date</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">
                  {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              {booking.expected_delivery_date && (
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Delivery</div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {new Date(booking.expected_delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}
              {booking.cancelled_at && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/10">
                  <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Cancelled On</div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {new Date(booking.cancelled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes & Refund */}
        {booking.notes && (
          <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm p-5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{booking.notes}</div>
          </div>
        )}

        {booking.refund_amount != null && booking.status === 'cancelled' && (
          <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5">
            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Refund Amount</div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(booking.refund_amount)}</div>
          </div>
        )}

      </div>

      <DeleteConfirmModal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
        title="Cancel Booking"
        description={`Cancel ${booking.booking_number}? Advance of ${formatCurrency(advancePaid)} will be marked for refund.`}
        confirmText="Cancel Booking"
      />
    </div>
  );
}
