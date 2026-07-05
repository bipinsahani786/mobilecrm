import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePartnerReferrals, usePartnerReferralDetail } from '../api/usePartnerReferrals';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { StatusBadge } from '@/components/ui/status-badge';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import { FilterContainer, FilterSearch, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';
import { useDebounce } from '@/hooks/useDebounce';
import { OnboardClientModal } from '../components/OnboardClientModal';

export default function PartnerReferralsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');

  const [detailId, setDetailId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  useEffect(() => { setPage(1); }, [debouncedSearch, filterStatus, fromDate, toDate]);

  const { data: referralsData, isLoading } = usePartnerReferrals({
    page, per_page: perPage,
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: referralDetail, isLoading: isDetailLoading } = usePartnerReferralDetail(detailId);

  const handleView = useCallback((id: number) => {
    setDetailId(id);
    setIsDetailOpen(true);
  }, []);

  const columns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: 'name', header: 'Business Name', sortable: true, cell: (row: any) => (
      <button onClick={() => handleView(row.id)} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline text-left">
        {row.name}
      </button>
    )},
    { accessorKey: 'email', header: 'Email', cell: (row: any) => (
      <span className="text-sm text-slate-500">{row.email}</span>
    )},
    { accessorKey: 'plan', header: 'Plan', cell: (row: any) => (
      <span className="text-sm font-medium">{row.plan?.name || '—'}</span>
    )},
    { accessorKey: 'status', header: 'Status', sortable: true, cell: (row: any) => (
      <StatusBadge status={row.status} />
    )},
    { accessorKey: 'created_at', header: 'Joined', sortable: true, cell: (row: any) => (
      <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
    )},
  ], [handleView]);

  const referrals = referralsData?.data ?? [];
  const totalItems = referralsData?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Building2} 
        title="My Referrals" 
        subtitle="Businesses you've referred to the platform" 
        actions={
          <Button onClick={() => setIsOnboardOpen(true)} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md">
            <Plus className="w-4 h-4 mr-2" />
            Onboard Client
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <FilterContainer>
          <FilterSearch value={search} onChange={setSearch} placeholder="SEARCH BY BUSINESS NAME, EMAIL..." wrapperClassName="flex-1 min-w-[280px]" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} placeholder="ALL STATUSES" wrapperClassName="w-full sm:w-44 shrink-0" options={[
            { value: 'active', label: 'ACTIVE' }, { value: 'inactive', label: 'INACTIVE' }, { value: 'suspended', label: 'SUSPENDED' }
          ]} />
          <FilterDate label="FROM" value={fromDate} onChange={setFromDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          <FilterDate label="TO" value={toDate} onChange={setToDate} wrapperClassName="w-full sm:w-48 shrink-0" />
          {(search || filterStatus || fromDate || toDate) && (
            <FilterReset onClick={() => { setSearch(''); setFilterStatus(''); setFromDate(''); setToDate(''); }} />
          )}
        </FilterContainer>

        <DataTable
          data={referrals}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={5} />}
          searchable={false}
          emptyIcon={<Building2 className="w-12 h-12 text-slate-400" />}
          emptyMessage="No referrals found."
          serverSide
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
          onSortChange={(key, order) => { setSortBy(key ? String(key) : undefined); setSortOrder(order ?? undefined); }}
        />
      </div>

      {/* Referral Detail Drawer */}
      <Drawer isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setDetailId(null); }} title="Referral Details">
        {isDetailLoading ? (
          <TableSkeleton rows={3} cols={2} />
        ) : referralDetail ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Business Info</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Name:</span> <span className="font-semibold">{referralDetail.business.name}</span></div>
                <div><span className="text-slate-400">Email:</span> <span>{referralDetail.business.email}</span></div>
                <div><span className="text-slate-400">Plan:</span> <span>{referralDetail.business.plan?.name || '—'}</span></div>
                <div><span className="text-slate-400">Status:</span> <StatusBadge status={referralDetail.business.status} /></div>
                <div><span className="text-slate-400">Joined:</span> <span>{new Date(referralDetail.business.created_at).toLocaleDateString('en-IN')}</span></div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Commission History</h4>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Total: ₹{referralDetail.total_commission.toLocaleString('en-IN')}
                </span>
              </div>
              {referralDetail.commissions.length > 0 ? (
                <div className="space-y-2">
                  {referralDetail.commissions.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 text-sm">
                      <div>
                        <span className="font-medium">₹{c.commission_amount.toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 ml-2">{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No commission history for this referral.</p>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>

      <OnboardClientModal 
        isOpen={isOnboardOpen} 
        onClose={() => setIsOnboardOpen(false)} 
      />
    </div>
  );
}
