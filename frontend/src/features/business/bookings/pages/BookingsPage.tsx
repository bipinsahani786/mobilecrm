import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, XCircle, ArrowRight, Package, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useBookings, useCancelBooking, downloadBookingPdf } from '../api/useBookings';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'booked', label: 'Booked' },
  { value: 'converted', label: 'Converted' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  booked: { label: 'Booked', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
  converted: { label: 'Converted', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
  expired: { label: 'Expired', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

export default function BookingsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);

  const { data: response, isLoading } = useBookings(page, 15, {
    search: search || undefined,
    status: status || undefined,
  });

  const cancelMutation = useCancelBooking();

  const bookings = response?.data?.data || [];
  const meta = response?.data?.meta || response?.data;
  const totalBookings = meta?.total || bookings.length;

  const handleCancel = async () => {
    if (!bookingToCancel) return;
    try {
      await cancelMutation.mutateAsync({ id: bookingToCancel.id });
      toast.success('Booking cancelled successfully');
      setBookingToCancel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadPdf = async (id: number, number: string) => {
    const downloadPromise = async () => {
      const response = await downloadBookingPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking-${number}.pdf`);
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'booking_number',
      header: 'Booking #',
      cell: (item: any) => (
        <button onClick={() => navigate(`/bookings/${item.id}`)} className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
          {item.booking_number}
        </button>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (item: any) => (
        <div className="text-xs text-slate-500">
          <div><span className="font-semibold text-slate-400">Booked:</span> {new Date(item.booking_date).toLocaleDateString()}</div>
          {item.expected_delivery_date && (
            <div><span className="font-semibold text-slate-400">Target:</span> {new Date(item.expected_delivery_date).toLocaleDateString()}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'product',
      header: 'Product(s)',
      cell: (item: any) => {
        const items = item.items || [];
        const firstItem = items[0];
        const moreCount = items.length - 1;
        return (
          <div>
            <div className="text-slate-700 dark:text-slate-300 font-medium">
              {firstItem ? firstItem.product?.model_name : '-'}
            </div>
            {moreCount > 0 && (
              <div className="text-[10px] text-primary-500 font-bold bg-primary-50 dark:bg-primary-500/10 inline-block px-1.5 py-0.5 rounded mt-0.5">
                +{moreCount} more
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
      cell: (item: any) => {
        const items = item.items || [];
        const totalQty = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
        return <span className="font-medium">{totalQty}</span>;
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: (item: any) => <span className="font-bold">{formatCurrency(item.total_amount)}</span>,
    },
    {
      accessorKey: 'advance_amount',
      header: 'Advance',
      cell: (item: any) => <span className="font-bold text-emerald-600">{formatCurrency(item.advance_amount)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (item: any) => {
        const cfg = statusConfig[item.status] || statusConfig.booked;
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.cls}`}>{cfg.label}</span>;
      },
    },
    {
      header: '',
      cell: (item: any) => (
        <div className="flex gap-1.5">
          <button 
            onClick={() => handleDownloadPdf(item.id, item.booking_number)} 
            className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-500" 
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(`/bookings/${item.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="View">
            <ArrowRight className="w-4 h-4" />
          </button>
          {item.status === 'booked' && (
            <button onClick={() => setBookingToCancel(item)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500" title="Cancel">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-200">
      
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] animate-float2" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6 z-20">
        
        {/* Premium Control Panel */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-4xl">
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Bookings"
                  value={totalBookings}
                  icon={<Calendar />}
                  glowColor="primary"
                  subtitle="All time bookings matching filter"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Booked"
                  value={bookings.filter((b: any) => b.status === 'booked').length}
                  icon={<Package />}
                  glowColor="amber"
                  subtitle="Currently active bookings"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Converted"
                  value={bookings.filter((b: any) => b.status === 'converted').length}
                  icon={<ArrowRight />}
                  glowColor="emerald"
                  subtitle="Converted to sales"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button 
                onClick={() => navigate('/bookings/new')}
                className="group relative flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">New Booking</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-start md:gap-8 lg:gap-12 items-stretch md:items-center bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 md:flex-initial md:items-center">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search booking number or customer..."
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Status Select */}
            <div className="w-full sm:w-44">
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val)}
                placeholder="All Status"
                options={[
                  { value: '', label: 'All Status' },
                  ...statusOptions
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center md:flex-initial">
            {/* Clear Filters */}
            {(search || status) && (
              <button
                onClick={() => { setSearch(''); setStatus(''); }}
                className="h-10 px-4 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
          {(!isLoading && bookings.length === 0) ? (
            <div className="py-24">
              <EmptyState
                icon={<Calendar className="w-8 h-8 opacity-50" />}
                title="No bookings found"
                description={
                  (search || status)
                    ? "No bookings match your active filters. Try refining your criteria."
                    : "You haven't made any bookings yet."
                }
                action={
                  !(search || status) && (
                    <button 
                      onClick={() => navigate('/bookings/new')}
                      className="mt-4 flex items-center justify-center gap-2 h-10 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/30 transition-all"
                    >
                      New Booking
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <DataTable
              isLoading={isLoading}
              loadingSkeleton={<TableSkeleton />}
              columns={columns}
              data={bookings}
              pagination={meta ? { currentPage: meta.current_page, totalPages: meta.last_page, onPageChange: setPage } : undefined}
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
        title="Cancel Booking"
        description={`Cancel booking ${bookingToCancel?.booking_number}? The advance amount of ${formatCurrency(bookingToCancel?.advance_amount || 0)} will be marked for refund.`}
        confirmText="Cancel Booking"
      />
    </div>
  );
}
