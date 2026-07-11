import { useState, useMemo } from 'react';
import { usePendingPayouts, useCompletedPayouts, useMarkPayoutReceived } from '../api/useFinance';
import { PageHeader } from '@/components/layout/PageHeader';
import { Wallet, CheckCircle2, Clock } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { getFinanceColumns } from '../constants/financeColumns';
import { MarkReceivedModal } from '../components/MarkReceivedModal';
import type { EmiDetail } from '../schemas/financeSchema';

export default function FinanceLedgerPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [page, setPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState<EmiDetail | null>(null);
  const [payoutDate, setPayoutDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: pendingResponse, isLoading: isLoadingPending } = usePendingPayouts(page);
  const { data: completedResponse, isLoading: isLoadingCompleted } = useCompletedPayouts(page);
  
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        title="Finance Ledger"
        subtitle="Track pending payouts from EMI financiers like Bajaj and TVS."
        icon={Wallet}
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-white/5">
            <button
              onClick={() => { setActiveTab('pending'); setPage(1); }}
              className={`px-6 py-4 flex items-center text-sm font-semibold tracking-wide uppercase transition-colors ${activeTab === 'pending' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Payouts
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setPage(1); }}
              className={`px-6 py-4 flex items-center text-sm font-semibold tracking-wide uppercase transition-colors ${activeTab === 'completed' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
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
