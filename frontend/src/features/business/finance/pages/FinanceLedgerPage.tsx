import { useState, useMemo, useEffect } from 'react';
import { usePendingPayouts, useCompletedPayouts, useMarkPayoutReceived } from '../api/useFinance';
import { PageHeader } from '@/components/layout/PageHeader';
import { Wallet, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { getFinanceColumns } from '../constants/financeColumns';
import { MarkReceivedModal } from '../components/MarkReceivedModal';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { formatCurrency } from '@/lib/formatters';
import type { EmiDetail } from '../schemas/financeSchema';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DatePicker } from '@/components/ui/DatePicker';

export default function FinanceLedgerPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [page, setPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState<EmiDetail | null>(null);
  const [payoutDate, setPayoutDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filters state
  const [search, setSearch] = useState('');
  const [financier, setFinancier] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounced search to prevent duplicate requests
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination when other filters change
  useEffect(() => {
    setPage(1);
  }, [financier, startDate, endDate]);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    financier: financier || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  }), [debouncedSearch, financier, startDate, endDate]);

  const { data: pendingResponse, isLoading: isLoadingPending } = usePendingPayouts(page, 15, filters);
  const { data: completedResponse, isLoading: isLoadingCompleted } = useCompletedPayouts(page, 15, filters);
  
  const markReceived = useMarkPayoutReceived();

  const handleMarkReceived = async () => {
    if (!selectedPayout) return;
    try {
      await markReceived.mutateAsync({ id: selectedPayout.id, payout_date: payoutDate });
      toast.success('Payout marked as received');
      setSelectedPayout(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payout');
    }
  };

  const columns = useMemo(() => getFinanceColumns({
    onMarkReceived: (emi) => setSelectedPayout(emi)
  }), []);

  const currentData = activeTab === 'pending' ? (pendingResponse?.data || []) : (completedResponse?.data || []);
  const currentMeta = activeTab === 'pending' ? pendingResponse?.meta : completedResponse?.meta;
  const isLoading = activeTab === 'pending' ? isLoadingPending : isLoadingCompleted;

  const handleClearFilters = () => {
    setSearch('');
    setFinancier('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-200 relative">
      
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] animate-float2" />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6 z-20">
        
        {/* KPI Analytics Cards */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div 
              className={`flex-1 transition-all hover:-translate-y-1 duration-300 cursor-pointer ${activeTab === 'pending' ? 'ring-2 ring-primary-500 rounded-2xl' : 'opacity-80 hover:opacity-100'}`}
              onClick={() => { setActiveTab('pending'); setPage(1); }}
            >
              <CustomKpiCard
                title="Pending Payouts"
                value={pendingResponse?.meta?.total || 0}
                icon={<Clock />}
                glowColor="primary"
                subtitle="Awaiting financier clearance"
              />
            </div>
            <div 
              className={`flex-1 transition-all hover:-translate-y-1 duration-300 cursor-pointer ${activeTab === 'pending' ? 'ring-2 ring-primary-500 rounded-2xl' : 'opacity-80 hover:opacity-100'}`}
              onClick={() => { setActiveTab('pending'); setPage(1); }}
            >
              <CustomKpiCard
                title="Expected Payout (This Page)"
                value={formatCurrency(
                  (pendingResponse?.data || []).reduce(
                    (sum: number, emi: any) => sum + (Number(emi.loan_amount || 0) - Number(emi.processing_fee || 0)),
                    0
                  )
                )}
                icon={<Wallet />}
                glowColor="primary"
                subtitle="Clearance value pending"
              />
            </div>
            <div 
              className={`flex-1 transition-all hover:-translate-y-1 duration-300 cursor-pointer ${activeTab === 'completed' ? 'ring-2 ring-primary-500 rounded-2xl' : 'opacity-80 hover:opacity-100'}`}
              onClick={() => { setActiveTab('completed'); setPage(1); }}
            >
              <CustomKpiCard
                title="Completed Payouts"
                value={completedResponse?.meta?.total || 0}
                icon={<CheckCircle2 />}
                glowColor="primary"
                subtitle="Cleared financier funds"
              />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-start md:gap-8 lg:gap-12 items-stretch md:items-center bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 md:flex-initial md:items-center">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number, customer name, phone, or financier..."
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Financier Filter */}
            <div className="w-full sm:w-48">
              <CustomSelect
                value={financier}
                onChange={(val) => setFinancier(val)}
                placeholder="All Financiers"
                options={[
                  { value: '', label: 'All Financiers' },
                  { value: 'Bajaj Finserv', label: 'Bajaj Finserv' },
                  { value: 'TVS Credit', label: 'TVS Credit' },
                  { value: 'HDB Financial', label: 'HDB Financial' },
                  { value: 'Home Credit', label: 'Home Credit' },
                  { value: 'IDFC First Bank', label: 'IDFC First Bank' },
                  { value: 'Pine Labs', label: 'Pine Labs' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center md:flex-initial">
            {/* Date Range */}
            <div className="flex items-center gap-1.5 justify-start">
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Start Date"
                className="w-[155px]"
                align="left-0 md:right-0 md:left-auto"
                controlSize="sm"
              />
              <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold shrink-0 select-none px-0.5">to</span>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="End Date"
                className="w-[155px]"
                align="right"
                controlSize="sm"
              />
            </div>

            {/* Clear Filters */}
            {(search || financier || startDate || endDate) && (
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
          <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <button
              onClick={() => { setActiveTab('pending'); setPage(1); }}
              className={`px-6 py-4 flex items-center text-sm font-semibold tracking-wide uppercase transition-colors relative ${activeTab === 'pending' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Payouts
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setPage(1); }}
              className={`px-6 py-4 flex items-center text-sm font-semibold tracking-wide uppercase transition-colors relative ${activeTab === 'completed' ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
              {activeTab === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          </div>

          <div className="p-0">
            {(!isLoading && currentData.length === 0) ? (
              <div className="p-12 text-center text-slate-500">
                No {activeTab} payouts found.
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={currentData} 
                isLoading={isLoading}
                loadingSkeleton={<TableSkeleton cols={6} rows={5} />}
                pagination={{
                  currentPage: currentMeta?.current_page || 1,
                  totalPages: currentMeta?.last_page || 1,
                  onPageChange: setPage
                }}
              />
            )}
          </div>
        </div>
      </div>

      <MarkReceivedModal 
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        payoutDate={payoutDate}
        setPayoutDate={setPayoutDate}
        onConfirm={handleMarkReceived}
        isLoading={markReceived.isPending}
      />
    </div>
  );
}
