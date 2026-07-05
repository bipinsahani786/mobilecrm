import { useState, useMemo, useEffect } from 'react';
import { useCommissions, useMarkCommissionPaid } from '../api/useCommissions';
import { usePartners } from '../../partners/api/usePartners';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getCommissionColumns } from '../constants/commissionColumns';
import { useDebounce } from '@/hooks/useDebounce';
import { FilterContainer, FilterSearch, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';

export default function CommissionsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPartner, setFilterPartner] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Sorting
  const [sortBy, setSortBy] = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterPartner, fromDate, toDate]);

  // Queries
  const { data: partnersData } = usePartners({ all: true });
  const partners = partnersData?.data;

  const { data: commissionsData, isLoading } = useCommissions({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
    partner_id: filterPartner ? Number(filterPartner) : undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const markPaid = useMarkCommissionPaid();

  const handleMarkPaid = async (id: number) => {
    try {
      await markPaid.mutateAsync(id);
      toast.success('Commission marked as paid');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update commission');
    }
  };

  const columns = useMemo(() => getCommissionColumns({
    onMarkPaid: handleMarkPaid,
    isMutating: markPaid.isPending
  }), [markPaid.isPending]);

  const paginatedCommissions = commissionsData?.data ?? [];
  const totalItems = commissionsData?.meta?.total ?? 0;

  const hasFilters = search || filterStatus || filterPartner || fromDate || toDate;

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterPartner('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={CheckCircle}
        title="Commissions & Payouts" 
        subtitle="Track and manage sales agent earnings."
      />

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Search & Filters */}
        <FilterContainer>
          {/* Search Bar with Theme Icon on Left */}
          <FilterSearch
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="SEARCH BY PARTNER, TENANT, OR PLAN..."
            wrapperClassName="flex-1 min-w-[280px]"
          />

          {/* Status filter */}
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="ALL STATUSES"
            wrapperClassName="w-full sm:w-44 shrink-0"
            options={[
              { value: 'pending', label: 'PENDING' },
              { value: 'paid', label: 'PAID' },
              { value: 'cancelled', label: 'CANCELLED' }
            ]}
          />

          {/* Partner filter */}
          <FilterSelect
            value={filterPartner}
            onChange={setFilterPartner}
            placeholder="ALL PARTNERS"
            searchable={true}
            wrapperClassName="w-full sm:w-44 shrink-0"
            options={partners?.map((p) => ({ value: String(p.id), label: p.name })) ?? []}
          />

          {/* FROM Date picker */}
          <FilterDate
            label="FROM"
            value={fromDate}
            onChange={(val) => setFromDate(val)}
            wrapperClassName="w-full sm:w-48 shrink-0"
          />

          {/* TO Date picker */}
          <FilterDate
            label="TO"
            value={toDate}
            onChange={(val) => setToDate(val)}
            wrapperClassName="w-full sm:w-48 shrink-0"
          />

          {/* RESET Button */}
          {hasFilters && (
            <FilterReset onClick={clearFilters} />
          )}
        </FilterContainer>

        <DataTable
          data={paginatedCommissions}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={7} />}
          searchable={false}
          emptyIcon={<CheckCircle className="w-12 h-12 text-slate-400" />}
          emptyMessage="No commissions found matching your criteria."
          serverSide
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
          onSortChange={(key, order) => {
            setSortBy(key ? String(key) : undefined);
            setSortOrder(order ?? undefined);
          }}
        />
      </div>
    </div>
  );
}
