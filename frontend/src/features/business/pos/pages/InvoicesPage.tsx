import { useState, useMemo, useEffect } from 'react';
import { useSales } from '../api/useSales';
import { Button } from '@/components/ui/button';
import { FileText, Plus, TrendingUp, DollarSign, ArrowRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getInvoiceColumns } from '../constants/invoiceColumns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { formatCurrency } from '@/lib/formatters';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasUdhar, setHasUdhar] = useState('');

  // Debounced search to prevent duplicate network calls
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination when filter selections change
  useEffect(() => {
    setPage(1);
  }, [paymentMode, startDate, endDate, hasUdhar]);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    payment_mode: paymentMode || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    has_udhar: hasUdhar || undefined,
  }), [debouncedSearch, paymentMode, startDate, endDate, hasUdhar]);

  const { data: response, isLoading } = useSales(page, 15, filters);
  const navigate = useNavigate();

  const sales = response?.data || [];
  const meta = response?.meta;

  const totalInvoices = meta?.total || 0;
  const totalRevenue = sales?.reduce((sum: number, sale: any) => sum + Number(sale.final_amount || 0), 0) || 0;
  const totalUdhar = sales?.reduce((sum: number, sale: any) => {
    const udharPayment = sale.payments?.find((p: any) => p.payment_mode === 'Udhar');
    return sum + Number(udharPayment?.amount || 0);
  }, 0) || 0;

  const columns = useMemo(() => getInvoiceColumns({
    onView: (sale) => navigate(`/invoices/${sale.id}`),
    onCustomerView: (customerId) => navigate(`/customers/${customerId}`),
    onResumeDraft: (saleId) => navigate(`/pos?draft_id=${saleId}`)
  }), [navigate]);

  const handleClearFilters = () => {
    setSearch('');
    setPaymentMode('');
    setStartDate('');
    setEndDate('');
    setHasUdhar('');
  };

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
                  title="Total Invoices"
                  value={totalInvoices}
                  icon={<FileText />}
                  glowColor="primary"
                  subtitle="All time sales"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Revenue (This Page)"
                  value={formatCurrency(totalRevenue)}
                  icon={<TrendingUp />}
                  glowColor="primary"
                  subtitle="Total from current view"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Udhar (This Page)"
                  value={formatCurrency(totalUdhar)}
                  icon={<DollarSign />}
                  glowColor="primary"
                  subtitle="Guarantor downpayments"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button 
                onClick={() => navigate('/pos')}
                className="group relative flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">New Sale</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number or customer name/phone..."
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Payment Mode */}
            <div className="w-full sm:w-44">
              <CustomSelect
                value={paymentMode}
                onChange={(val) => setPaymentMode(val)}
                placeholder="All Payment Modes"
                options={[
                  { value: '', label: 'All Payment Modes' },
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Split', label: 'Split' },
                  { value: 'EMI', label: 'EMI / Finance' },
                  { value: 'Udhar', label: 'Udhar (Credit)' },
                ]}
              />
            </div>

            {/* Udhar Filter */}
            <div className="w-full sm:w-48">
              <CustomSelect
                value={hasUdhar}
                onChange={(val) => setHasUdhar(val)}
                placeholder="All Invoices"
                options={[
                  { value: '', label: 'All Invoices' },
                  { value: 'yes', label: 'With Guarantor Udhar' },
                  { value: 'no', label: 'No Guarantor Udhar' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                title="Start Date"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                title="End Date"
              />
            </div>

            {/* Clear Filters */}
            {(search || paymentMode || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
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
          {(!isLoading && sales.length === 0) ? (
            <div className="py-24">
              <EmptyState
                icon={<FileText className="w-8 h-8 opacity-50" />}
                title="No invoices found"
                description={
                  (search || paymentMode || startDate || endDate)
                    ? "No invoices match your active filters. Try refining your criteria."
                    : "You haven't made any sales yet. Go to POS to create your first bill."
                }
                action={
                  !(search || paymentMode || startDate || endDate) && (
                    <button 
                      onClick={() => navigate('/pos')}
                      className="mt-4 flex items-center justify-center gap-2 h-10 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/30 transition-all"
                    >
                      Go to POS
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={sales} 
              isLoading={isLoading}
              loadingSkeleton={<TableSkeleton cols={7} rows={8} />}
              pagination={{
                currentPage: meta?.current_page || 1,
                totalPages: meta?.last_page || 1,
                onPageChange: setPage
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
