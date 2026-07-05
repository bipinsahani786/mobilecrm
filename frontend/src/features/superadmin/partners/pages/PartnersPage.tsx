import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePartners, useDeletePartner, useUpdatePartner, type Partner } from '../api/usePartners';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PartnerFormModal } from '../components/PartnerFormModal';
import { PartnerDetailDrawer } from '../components/PartnerDetailDrawer';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { FilterContainer, FilterSearch, FilterSelect, FilterDate, FilterReset } from '@/components/ui/filter-controls';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { getPartnerColumns } from '../constants/partnerColumns';
import { useDebounce } from '@/hooks/useDebounce';

export default function PartnersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterStatus, setFilterStatus] = useState<'active' | 'suspended' | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, fromDate, toDate]);

  const mappedStatus = useMemo(() => {
    if (filterStatus === 'active') return true;
    if (filterStatus === 'suspended') return false;
    return undefined;
  }, [filterStatus]);

  const { data: partnersData, isLoading } = usePartners({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: mappedStatus,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const deletePartner = useDeletePartner();
  const updatePartner = useUpdatePartner();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [detailPartnerId, setDetailPartnerId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const partners = partnersData?.data ?? [];
  const totalItems = partnersData?.meta?.total ?? 0;

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    try {
      await deletePartner.mutateAsync(partnerToDelete.id);
      toast.success('Partner deleted successfully');
      setPartnerToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete partner');
    }
  };

  const handleEditClick = useCallback((partner: Partner) => {
    setSelectedPartner(partner);
    setIsFormOpen(true);
  }, []);

  const handleViewClick = useCallback((id: number) => {
    setDetailPartnerId(id);
    setIsDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (partner: Partner, newStatus: boolean) => {
    try {
      await updatePartner.mutateAsync({ id: partner.id, data: { status: newStatus } });
      toast.success(`Partner status updated successfully.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update partner status');
    }
  }, [updatePartner]);

  const columns = useMemo(() => getPartnerColumns({
    onEdit: handleEditClick,
    onView: handleViewClick,
    onStatusChange: handleStatusChange,
    isUpdating: updatePartner.isPending
  }), [handleEditClick, handleViewClick, handleStatusChange, updatePartner.isPending]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Briefcase}
        title="Sales Partners"
        subtitle="Manage your sales agents and affiliates"
        actions={
          <Button
            onClick={() => { setSelectedPartner(null); setIsFormOpen(true); }}
            size="sm"
            className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        
        {/* Search & Filters */}
        <FilterContainer>
          {/* Search Bar with Theme Icon on Left */}
          <FilterSearch
            value={search}
            onChange={(val) => { setSearch(val); }}
            placeholder="SEARCH AGENTS BY NAME, COMPANY, EMAIL..."
            wrapperClassName="flex-1 min-w-[280px]"
          />

          {/* Status Select dropdown */}
          <FilterSelect
            value={filterStatus}
            onChange={(val) => setFilterStatus(val as any)}
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
          {(search || filterStatus || fromDate || toDate) && (
            <FilterReset
              onClick={() => {
                setSearch('');
                setFilterStatus('');
                setFromDate('');
                setToDate('');
              }}
            />
          )}
        </FilterContainer>

        <DataTable
          data={partners}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={8} />}
          searchable={false}
          emptyIcon={<Briefcase className="w-12 h-12 text-slate-400" />}
          emptyMessage="No partners found matching your criteria."
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

      <PartnerFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedPartner(null); }}
        partner={selectedPartner}
      />

      <PartnerDetailDrawer
        partnerId={detailPartnerId}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setDetailPartnerId(null); }}
      />

      <DeleteConfirmModal
        isOpen={partnerToDelete !== null}
        onClose={() => setPartnerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Sales Partner"
        description="This action cannot be undone. All commissions, statistics, and referrals associated with this sales partner will be deleted or orphaned."
        itemName={partnerToDelete?.name}
        confirmText="DELETE"
      />
    </div>
  );
}
