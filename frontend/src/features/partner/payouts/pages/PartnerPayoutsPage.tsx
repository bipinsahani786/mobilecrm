import { useState, useMemo, useEffect } from 'react';
import { usePartnerPayouts, useCreatePayoutRequest } from '../api/usePartnerPayouts';
import { usePartnerDashboard } from '../../dashboard/api/usePartnerDashboard';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Wallet, Plus } from 'lucide-react';
import { FilterContainer, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';
import { toast } from 'sonner';

export default function PartnerPayoutsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  useEffect(() => { setPage(1); }, [filterStatus, fromDate, toDate]);

  const { data: payoutsData, isLoading } = usePartnerPayouts({
    page, per_page: perPage,
    status: filterStatus || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: dashboard } = usePartnerDashboard();
  const createPayout = useCreatePayoutRequest();

  const availablePayout = dashboard?.stats?.available_payout ?? 0;

  const handleCreatePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > availablePayout) {
      toast.error(`Amount exceeds available balance (₹${availablePayout.toLocaleString('en-IN')})`);
      return;
    }
    try {
      await createPayout.mutateAsync({ amount, notes: payoutNotes || undefined });
      toast.success('Payout request created successfully');
      setIsModalOpen(false);
      setPayoutAmount('');
      setPayoutNotes('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create payout request');
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: 'amount', header: 'Amount', cell: (row: any) => (
      <span className="font-bold text-slate-800 dark:text-white">₹{row.amount?.toLocaleString('en-IN')}</span>
    )},
    { accessorKey: 'status', header: 'Status', cell: (row: any) => (
      <StatusBadge status={row.status} />
    )},
    { accessorKey: 'notes', header: 'Notes', cell: (row: any) => (
      <span className="text-sm text-slate-500 truncate max-w-[200px] block">{row.notes || '—'}</span>
    )},
    { accessorKey: 'payment_reference', header: 'UTR / Ref', cell: (row: any) => (
      <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{row.payment_reference || '—'}</span>
    )},
    { accessorKey: 'created_at', header: 'Requested', cell: (row: any) => (
      <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
    )},
    { accessorKey: 'paid_at', header: 'Paid On', cell: (row: any) => (
      <span className="text-sm text-slate-500">{row.paid_at ? new Date(row.paid_at).toLocaleDateString('en-IN') : '—'}</span>
    )},
  ], []);

  const payouts = payoutsData?.data ?? [];
  const totalItems = payoutsData?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Wallet}
        title="Payout Requests"
        subtitle="Request and track your payouts"
        actions={
          <Button
            onClick={() => {
              if (availablePayout <= 0) {
                toast.error('Insufficient available balance to request a payout.');
                return;
              }
              setIsModalOpen(true);
            }}
            size="sm"
            className={`text-white shadow-sm font-semibold rounded-md ${availablePayout > 0 ? 'bg-primary-500 hover:bg-primary-600' : 'bg-primary-500/50 cursor-not-allowed'}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Available Balance Banner */}
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/5 dark:from-primary-500/20 dark:to-primary-600/10 border border-primary-200/50 dark:border-primary-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Available for Payout</p>
            <p className="text-3xl font-extrabold text-primary-700 dark:text-primary-300 mt-1">₹{availablePayout.toLocaleString('en-IN')}</p>
          </div>
          <Wallet className="w-10 h-10 text-primary-400/50" />
        </div>

        {/* Filters */}
        <FilterContainer>
          <FilterSelect value={filterStatus} onChange={setFilterStatus} placeholder="ALL STATUSES" wrapperClassName="w-full sm:w-44 shrink-0" options={[
            { value: 'pending', label: 'PENDING' }, { value: 'approved', label: 'APPROVED' }, { value: 'paid', label: 'PAID' }, { value: 'rejected', label: 'REJECTED' }
          ]} />
          <FilterDate label="FROM" value={fromDate} onChange={setFromDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          <FilterDate label="TO" value={toDate} onChange={setToDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          {(filterStatus || fromDate || toDate) && (
            <FilterReset onClick={() => { setFilterStatus(''); setFromDate(''); setToDate(''); }} />
          )}
        </FilterContainer>

        <DataTable
          data={payouts}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={6} />}
          searchable={false}
          emptyIcon={<Wallet className="w-12 h-12 text-slate-400" />}
          emptyMessage="No payout requests yet."
          serverSide
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
        />
      </div>

      {/* Create Payout Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Payout">
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-sm">
            <span className="text-slate-400">Available Balance:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-2">₹{availablePayout.toLocaleString('en-IN')}</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              max={availablePayout}
              min={1}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Notes (Optional)</label>
            <textarea
              value={payoutNotes}
              onChange={(e) => setPayoutNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
              placeholder="Any notes for the admin..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreatePayout}
              disabled={createPayout.isPending}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              {createPayout.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
