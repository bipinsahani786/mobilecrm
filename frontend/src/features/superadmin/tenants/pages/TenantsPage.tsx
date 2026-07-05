import { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Building2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { useSuperadminTenants, useUpdateTenantStatus } from '../api/useSuperadminTenants';
import { useQueryClient } from '@tanstack/react-query';
import { FilterContainer, FilterSearch, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';
import { OnboardTenantModal } from '../components/OnboardTenantModal';
import { EditTenantModal } from '../components/EditTenantModal';
import { getTenantColumns } from '../constants/tenantColumns';
import { useDebounce } from '@/hooks/useDebounce';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterStatus, setFilterStatus] = useState<'active' | 'suspended' | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [sortBy, setSortBy] = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');

  // Reset page to 1 on debounced search, filter status change, or date filters
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, fromDate, toDate]);

  const { data: tenantsData, isLoading } = useSuperadminTenants({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTenantStatus();
  const queryClient = useQueryClient();
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<any | null>(null);

  const [tenantToSuspend, setTenantToSuspend] = useState<any | null>(null);

  const executeStatusUpdate = useCallback((business: any, status: 'active' | 'suspended') => {
    updateStatus(
      { id: business.id, status },
      {
        onSuccess: () => {
          toast.success(`Business ${status === 'active' ? 'activated' : 'suspended'} successfully.`);
          queryClient.invalidateQueries({ queryKey: ['superadmin', 'businesses'] });
        },
        onError: () => {
          toast.error('Failed to update business status.');
        }
      }
    );
  }, [updateStatus, queryClient]);

  const handleStatusChange = useCallback((business: any, newStatus: 'active' | 'suspended') => {
    if (newStatus === 'suspended') {
      setTenantToSuspend(business);
      return;
    }

    executeStatusUpdate(business, 'active');
  }, [executeStatusUpdate]);

  const handleConfirmSuspend = () => {
    if (!tenantToSuspend) return;
    executeStatusUpdate(tenantToSuspend, 'suspended');
    setTenantToSuspend(null);
  };

  const handleEditClick = useCallback((business: any) => {
    setTenantToEdit(business);
    setIsEditModalOpen(true);
  }, []);

  const columns = useMemo(() => getTenantColumns({
    onEdit: handleEditClick,
    onStatusChange: handleStatusChange,
    isUpdating
  }), [handleEditClick, handleStatusChange, isUpdating]);

  const paginatedBusinesses = tenantsData?.data ?? [];
  const totalItems = tenantsData?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Building2}
        title="Tenant Management"
        subtitle="Monitor and manage businesses on your platform"
        actions={
          <Button onClick={() => setIsOnboardModalOpen(true)} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md">
            <Plus className="w-4 h-4 mr-2" />
            Onboard Business
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Search & Filters */}
        <FilterContainer>
          {/* Search Bar with Theme Icon on Left */}
          <FilterSearch
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="SEARCH BY NAME, EMAIL, OR GSTIN..."
            wrapperClassName="flex-1 min-w-[280px]"
          />

          {/* Status Select dropdown */}
          <FilterSelect
            value={filterStatus}
            onChange={(val) => { setFilterStatus(val as any); setPage(1); }}
            placeholder="ALL STATUSES"
            wrapperClassName="w-full sm:w-44 shrink-0"
            options={[
              { value: 'active', label: 'ACTIVE' },
              { value: 'suspended', label: 'SUSPENDED' }
            ]}
          />

          {/* FROM Date picker */}
          <FilterDate
            label="FROM"
            value={fromDate}
            onChange={(val) => { setFromDate(val); setPage(1); }}
            wrapperClassName="w-full sm:w-48 shrink-0"
          />

          {/* TO Date picker */}
          <FilterDate
            label="TO"
            value={toDate}
            onChange={(val) => { setToDate(val); setPage(1); }}
            wrapperClassName="w-full sm:w-48 shrink-0"
          />

          {/* RESET Button */}
          {(search || filterStatus || fromDate || toDate) && (
            <FilterReset
              onClick={() => {
                setSearch('');
                setFilterStatus('');
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
            />
          )}
        </FilterContainer>

        <DataTable
          data={paginatedBusinesses}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={5} />}
          searchable={false}
          emptyIcon={<Building2 className="w-12 h-12" />}
          emptyMessage="No businesses found matching your criteria."
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

      <OnboardTenantModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />

      <EditTenantModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTenantToEdit(null);
        }}
        tenant={tenantToEdit}
      />

      <DeleteConfirmModal
        isOpen={tenantToSuspend !== null}
        onClose={() => setTenantToSuspend(null)}
        onConfirm={handleConfirmSuspend}
        title="Suspend Tenant Business"
        description="Are you sure you want to suspend this business? All associated users will lose dashboard and billing access immediately."
        itemName={tenantToSuspend?.name}
        confirmText="SUSPEND"
      />
    </div>
  );
}
