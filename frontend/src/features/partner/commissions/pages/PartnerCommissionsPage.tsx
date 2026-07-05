import { useState, useMemo, useEffect } from 'react';
import { usePartnerCommissions, usePartnerCommissionStats } from '../api/usePartnerCommissions';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/ui/stat-card';
import { Coins, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import { FilterContainer, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';

export default function PartnerCommissionsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');

  useEffect(() => { setPage(1); }, [filterStatus, fromDate, toDate]);

  const { data: commissionsData, isLoading } = usePartnerCommissions({
    page, per_page: perPage,
    status: filterStatus || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: stats } = usePartnerCommissionStats();

  const columns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: 'business', header: 'Business', cell: (row: any) => (
      <span className="font-semibold text-slate-800 dark:text-white">{row.business?.name || '—'}</span>
    )},
    { accessorKey: 'plan', header: 'Plan', cell: (row: any) => (
      <span className="text-sm">{row.plan?.name || '—'}</span>
    )},
    { accessorKey: 'amount_paid_by_tenant', header: 'Tenant Paid', sortable: true, cell: (row: any) => (
      <div className="flex flex-col">
        <span className="text-sm">₹{row.amount_paid_by_tenant?.toLocaleString('en-IN')}</span>
        {row.payment_collected_by === 'partner' && (
          <span className="text-[10px] font-bold tracking-wide uppercase text-orange-500 mt-0.5">
            Offline Cash
          </span>
        )}
      </div>
    )},
    { accessorKey: 'commission_amount', header: 'Your Commission', sortable: true, cell: (row: any) => (
      <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{row.commission_amount?.toLocaleString('en-IN')}</span>
    )},
    { accessorKey: 'status', header: 'Status', sortable: true, cell: (row: any) => (
      <StatusBadge status={row.status} />
    )},
    { accessorKey: 'created_at', header: 'Date', sortable: true, cell: (row: any) => (
      <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
    )},
  ], []);

  const commissions = commissionsData?.data ?? [];
  const totalItems = commissionsData?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader icon={Coins} title="My Commissions" subtitle="Track all your commission earnings" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Earned" value={`₹${(stats?.total_earned ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} subtitle="Lifetime commission" />
          <StatCard title="Paid" value={`₹${(stats?.paid ?? 0).toLocaleString('en-IN')}`} icon={CheckCircle} subtitle="Amount received" />
          <StatCard title="Pending" value={`₹${(stats?.pending ?? 0).toLocaleString('en-IN')}`} icon={Clock} subtitle="Awaiting payout" />
        </div>

        {/* Filters */}
        <FilterContainer>
          <FilterSelect value={filterStatus} onChange={setFilterStatus} placeholder="ALL STATUSES" wrapperClassName="w-full sm:w-44 shrink-0" options={[
            { value: 'pending', label: 'PENDING' }, { value: 'paid', label: 'PAID' }, { value: 'cancelled', label: 'CANCELLED' }
          ]} />
          <FilterDate label="FROM" value={fromDate} onChange={setFromDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          <FilterDate label="TO" value={toDate} onChange={setToDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          {(filterStatus || fromDate || toDate) && (
            <FilterReset onClick={() => { setFilterStatus(''); setFromDate(''); setToDate(''); }} />
          )}
        </FilterContainer>

        {/* Table */}
        <DataTable
          data={commissions}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={6} />}
          searchable={false}
          emptyIcon={<Coins className="w-12 h-12 text-slate-400" />}
          emptyMessage="No commissions found."
          serverSide
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
          onSortChange={(key, order) => { setSortBy(key ? String(key) : undefined); setSortOrder(order ?? undefined); }}
        />
      </div>
    </div>
  );
}
