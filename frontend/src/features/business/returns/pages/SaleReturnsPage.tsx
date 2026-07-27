import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, Search, ArrowRight, CornerDownLeft, RefreshCcw, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useSaleReturns } from '../api/useSaleReturns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';

const typeOptions = [
  { value: 'refund', label: 'Refund (Cash/UPI)' },
];

const typeConfig: Record<string, { label: string; cls: string }> = {
  refund: { label: 'Refund', cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
};

export default function SaleReturnsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [refundType, setRefundType] = useState('');

  const { data: response, isLoading } = useSaleReturns(page, 15, {
    search: search || undefined,
    refund_type: refundType || undefined,
  });

  const returns = response?.data?.data || [];
  const meta = response?.data?.meta || response?.data;
  const totalReturns = meta?.total || returns.length;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'return_number',
      header: 'Return #',
      cell: (item: any) => (
        <div>
          <button onClick={() => navigate(`/sale-returns/${item.id}`)} className="font-bold text-primary-600 dark:text-primary-400 hover:underline block">
            {item.return_number}
          </button>
          <span className="text-xs text-slate-500">Invoice: {item.sale?.invoice_number}</span>
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (item: any) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.customer?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">{item.customer?.phone || ''}</div>
        </div>
      ),
    },
    {
      accessorKey: 'items_count',
      header: 'Items',
      cell: (item: any) => <span className="font-medium text-slate-600 dark:text-slate-400">{item.items?.length || 0} items</span>,
    },
    {
      accessorKey: 'total_return_amount',
      header: 'Amount',
      cell: (item: any) => <span className="font-bold">{formatCurrency(item.total_return_amount)}</span>,
    },
    {
      accessorKey: 'return_date',
      header: 'Date',
      cell: (item: any) => new Date(item.return_date).toLocaleDateString('en-IN'),
    },
    {
      accessorKey: 'refund_type',
      header: 'Type',
      cell: (item: any) => {
        const cfg = typeConfig[item.refund_type] || typeConfig.refund;
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.cls}`}>{cfg.label}</span>;
      },
    },
    {
      header: '',
      cell: (item: any) => (
        <div className="flex gap-1.5">
          <button onClick={() => navigate(`/sale-returns/${item.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="View">
            <ArrowRight className="w-4 h-4" />
          </button>
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
                  title="Total Returns"
                  value={totalReturns}
                  icon={<CornerDownLeft />}
                  glowColor="primary"
                  subtitle="All time returns matching filter"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Refunds"
                  value={returns.filter((r: any) => r.refund_type === 'refund').length}
                  icon={<RefreshCcw />}
                  glowColor="rose"
                  subtitle="Total refunds issued"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button 
                onClick={() => navigate('/sale-returns/new')}
                className="group relative flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">New Return</span>
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
                placeholder="Search returns or invoices..."
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Type Select */}
            <div className="w-full sm:w-44">
              <CustomSelect
                value={refundType}
                onChange={(val) => setRefundType(val)}
                placeholder="All Types"
                options={[
                  { value: '', label: 'All Types' },
                  ...typeOptions
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center md:flex-initial">
            {/* Clear Filters */}
            {(search || refundType) && (
              <button
                onClick={() => { setSearch(''); setRefundType(''); }}
                className="h-10 px-4 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
          {(!isLoading && returns.length === 0) ? (
            <div className="py-24">
              <EmptyState
                icon={<CornerDownLeft className="w-8 h-8 opacity-50" />}
                title="No returns found"
                description={
                  (search || refundType)
                    ? "No returns match your active filters. Try refining your criteria."
                    : "You haven't processed any returns yet."
                }
              />
            </div>
          ) : (
            <DataTable
              isLoading={isLoading}
              loadingSkeleton={<TableSkeleton />}
              columns={columns}
              data={returns}
              pagination={meta ? { currentPage: meta.current_page, totalPages: meta.last_page, onPageChange: setPage } : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
