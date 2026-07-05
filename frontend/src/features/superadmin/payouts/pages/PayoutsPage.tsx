import { useState, useMemo, useEffect } from 'react';
import { useAdminPayouts, useAdminPayoutStats, useApprovePayoutRequest, useRejectPayoutRequest, useMarkPayoutPaid } from '../api/usePayouts';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Wallet, CheckCircle, XCircle, Clock, Banknote, History } from 'lucide-react';
import { FilterContainer, FilterSearch, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

export default function SuperadminPayoutsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'markPaid' | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  useEffect(() => { setPage(1); }, [debouncedSearch, filterStatus, fromDate, toDate]);

  const { data: payoutsData, isLoading } = useAdminPayouts({
    page, per_page: perPage,
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: stats } = useAdminPayoutStats();
  
  const approveMutation = useApprovePayoutRequest();
  const rejectMutation = useRejectPayoutRequest();
  const markPaidMutation = useMarkPayoutPaid();

  const handleApprove = async () => {
    if (!selectedPayout) return;
    try {
      await approveMutation.mutateAsync({ id: selectedPayout.id, admin_notes: adminNotes });
      toast.success('Payout request approved');
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedPayout) return;
    try {
      await rejectMutation.mutateAsync({ id: selectedPayout.id, admin_notes: adminNotes });
      toast.success('Payout request rejected');
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedPayout) return;
    if (!paymentRef.trim()) {
      toast.error('Payment reference is required');
      return;
    }
    try {
      await markPaidMutation.mutateAsync({ id: selectedPayout.id, payment_reference: paymentRef, admin_notes: adminNotes });
      toast.success('Payout marked as paid');
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark paid');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPayout(null);
    setAdminNotes('');
    setPaymentRef('');
  };

  const columns = useMemo(() => [
    { header: 'Partner', cell: (row: any) => (
      <div>
        <div className="font-semibold text-slate-800 dark:text-white">{row.partner?.name || '—'}</div>
        <div className="text-xs text-slate-500">{row.partner?.email}</div>
      </div>
    )},
    { header: 'Amount', accessorKey: 'amount', cell: (row: any) => (
      <span className="font-bold text-slate-800 dark:text-white">₹{row.amount?.toLocaleString('en-IN')}</span>
    )},
    { header: 'Status', accessorKey: 'status', cell: (row: any) => (
      <StatusBadge status={row.status} />
    )},
    { header: 'Requested', accessorKey: 'created_at', cell: (row: any) => (
      <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
    )},
    { header: '', className: 'text-right', cell: (row: any) => (
      <div className="flex justify-end gap-2">
        {row.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50" onClick={() => { setSelectedPayout(row); setActiveModal('approve'); }}>
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50" onClick={() => { setSelectedPayout(row); setActiveModal('reject'); }}>
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
          </>
        )}
        {row.status === 'approved' && (
          <Button size="sm" className="bg-primary-500 text-white hover:bg-primary-600" onClick={() => { setSelectedPayout(row); setActiveModal('markPaid'); }}>
            <Banknote className="w-4 h-4 mr-1" /> Mark Paid
          </Button>
        )}
      </div>
    )},
  ], []);

  const payouts = payoutsData?.data ?? [];
  const totalItems = payoutsData?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader icon={Wallet} title="Payout Management" subtitle="Review and process partner payout requests" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Paid" value={`₹${(stats?.total_paid_amount ?? 0).toLocaleString('en-IN')}`} icon={Wallet} subtitle={`${stats?.paid ?? 0} requests`} />
          <StatCard title="Pending Amount" value={`₹${(stats?.total_pending_amount ?? 0).toLocaleString('en-IN')}`} icon={Clock} subtitle={`${stats?.pending ?? 0} requests`} />
          <StatCard title="Approved" value={stats?.approved ?? 0} icon={CheckCircle} subtitle="Ready to pay" />
          <StatCard title="Total Requests" value={stats?.total_requests ?? 0} icon={History} />
        </div>

        {/* Filters */}
        <FilterContainer>
          <FilterSearch value={search} onChange={setSearch} placeholder="SEARCH PARTNER..." wrapperClassName="flex-1 min-w-[280px]" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} placeholder="ALL STATUSES" wrapperClassName="w-full sm:w-44 shrink-0" options={[
            { value: 'pending', label: 'PENDING' }, { value: 'approved', label: 'APPROVED' }, { value: 'paid', label: 'PAID' }, { value: 'rejected', label: 'REJECTED' }
          ]} />
          <FilterDate label="FROM" value={fromDate} onChange={setFromDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          <FilterDate label="TO" value={toDate} onChange={setToDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          {(search || filterStatus || fromDate || toDate) && (
            <FilterReset onClick={() => { setSearch(''); setFilterStatus(''); setFromDate(''); setToDate(''); }} />
          )}
        </FilterContainer>

        {/* Table */}
        <DataTable
          data={payouts}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={5} />}
          searchable={false}
          emptyIcon={<Wallet className="w-12 h-12 text-slate-400" />}
          emptyMessage="No payout requests found."
          serverSide
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
        />
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'approve'} onClose={closeModal} title="Approve Payout">
        <div className="space-y-4">
          <p className="text-sm">Are you sure you want to approve this <strong>₹{selectedPayout?.amount?.toLocaleString('en-IN')}</strong> payout for <strong>{selectedPayout?.partner?.name}</strong>?</p>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Admin Notes (Optional)</label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Internal notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'reject'} onClose={closeModal} title="Reject Payout">
        <div className="space-y-4">
          <p className="text-sm">Are you sure you want to reject this <strong>₹{selectedPayout?.amount?.toLocaleString('en-IN')}</strong> payout?</p>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Reason for Rejection</label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Let the partner know why..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleReject} disabled={rejectMutation.isPending} className="bg-rose-600 hover:bg-rose-700 text-white">Reject</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'markPaid'} onClose={closeModal} title="Mark as Paid">
        <div className="space-y-4">
          <p className="text-sm">Confirm that you have paid <strong>₹{selectedPayout?.amount?.toLocaleString('en-IN')}</strong> to <strong>{selectedPayout?.partner?.name}</strong>.</p>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">UTR / Payment Reference *</label>
            <input type="text" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. UTR123456789" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Notes (Optional)</label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={markPaidMutation.isPending} className="bg-primary-500 hover:bg-primary-600 text-white">Confirm Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
