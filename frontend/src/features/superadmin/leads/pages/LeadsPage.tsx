import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useLeads, useDeleteLead, useUpdateLead, useLeadStats, type Lead } from '../api/useLeads';
import { DataTable } from '@/components/ui/data-table';
import { useDebounce } from '@/hooks/useDebounce';
import { useImportLeads } from '../api/useLeadContacts';
import { usePartners } from '../../partners/api/usePartners';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { LeadFormModal } from '../components/LeadFormModal';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Plus, Users, Upload, Download,
  MessageSquare, Filter, TrendingUp, UserCheck,
  UserX, AlertCircle, Send
} from 'lucide-react';
import { getLeadColumns } from '../constants/leadColumns';
import { BulkMessageModal } from '../components/BulkMessageModal';
import {
  FilterContainer,
  FilterSearch,
  FilterSelect,
  FilterDate,
  FilterReset
} from '@/components/ui/filter-controls';

const SAMPLE_CSV = `business_name,contact_person,phone,email,referral_code,status,notes
Acme Corp,John Doe,9876543210,john@acme.com,ABC12345,new,Interested in basic plan
Beta Traders,Jane Smith,9123456789,jane@beta.com,XYZ67890,contacted,Follow up next week`;

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'leads_import_sample.csv'; a.click();
  URL.revokeObjectURL(url);
}


export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filters
  const [search, setSearch]               = useState('');
  const debouncedSearch                   = useDebounce(search, 400);
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterFollowUp, setFilterFollowUp] = useState('');
  const [fromDate, setFromDate]           = useState('');
  const [toDate, setToDate]               = useState('');

  // Sorting
  const [sortBy, setSortBy]               = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder]         = useState<'asc' | 'desc' | undefined>('desc');

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterPartner, filterOutcome, filterFollowUp, fromDate, toDate]);

  // Queries
  const { data: leadsData, isLoading } = useLeads({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
    partner_id: filterPartner || undefined,
    outcome: filterOutcome || undefined,
    follow_up_date: filterFollowUp || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: statsData, isLoading: isLoadingStats } = useLeadStats();
  const { data: partnersData }        = usePartners({ all: true });
  const partners                      = partnersData?.data;
  
  const deleteLead                    = useDeleteLead();
  const updateLead                    = useUpdateLead();
  const importLeads                   = useImportLeads();
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead]     = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const toggleSelection = (id: number) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (paginatedLeads.length === 0) return;
    if (selectedLeadIds.length === paginatedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(paginatedLeads.map(l => l.id));
    }
  };

  // Stats Card Calculations (obtained server-side)
  const stats = useMemo(() => {
    return statsData ?? { total: 0, newCount: 0, contacted: 0, converted: 0, lost: 0, rate: 0 };
  }, [statsData]);

  const paginatedLeads = leadsData?.data ?? [];
  const totalItems = leadsData?.meta?.total ?? 0;

  // Handlers
  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      await updateLead.mutateAsync({ id: lead.id, data: { status: newStatus as any } });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const handleDeleteClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeadToDelete(lead);
  };
  
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead.mutateAsync(leadToDelete.id);
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    } finally {
      setLeadToDelete(null);
    }
  };

  const baseColumns = useMemo(() => getLeadColumns({
    onStatusChange: handleStatusChange,
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
    isDeleting: deleteLead.isPending
  }), [deleteLead.isPending]);

  const columns = useMemo(() => {
    return [
      {
        header: '',
        cell: (lead: Lead) => (
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 bg-slate-100 border-slate-300 dark:bg-black/40 dark:border-white/20"
            checked={selectedLeadIds.includes(lead.id)} 
            onChange={() => {}}
            onClick={(e) => { e.stopPropagation(); toggleSelection(lead.id); }} 
          />
        ),
        className: '!px-3 !py-1.5 w-10 text-center'
      },
      ...baseColumns
    ];
  }, [baseColumns, selectedLeadIds]);

  // Filter setters resetting page to 1
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilterChange = (val: string) => { setFilterStatus(val); setPage(1); };
  const handlePartnerFilterChange = (val: string) => { setFilterPartner(val); setPage(1); };
  const handleOutcomeFilterChange = (val: string) => { setFilterOutcome(val); setPage(1); };
  const handleFollowUpFilterChange = (val: string) => { setFilterFollowUp(val); setPage(1); };

  const clearFilters = () => {
    setSearch(''); setFilterStatus(''); setFilterPartner(''); setFilterOutcome(''); setFilterFollowUp('');
    setFromDate(''); setToDate('');
    setPage(1);
  };
  const hasFilters = search || filterStatus || filterPartner || filterOutcome || filterFollowUp || fromDate || toDate;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const result = await importLeads.mutateAsync(file);
      toast.success(`${result.imported} leads imported!`);
      if (result.errors?.length) toast.warning(`${result.errors.length} rows had errors`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Users}
        title="Partner Leads"
        subtitle="Track, filter, and manage your sales pipeline"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <Button size="sm" variant="outline" onClick={downloadSampleCSV}
              className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10">
              <Download className="w-4 h-4 mr-1.5" /> Sample CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}
              disabled={importLeads.isPending}
              className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10">
              <Upload className="w-4 h-4 mr-1.5" />
              {importLeads.isPending ? 'Importing...' : 'Import CSV'}
            </Button>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold"
              onClick={() => { setSelectedLead(null); setIsFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Lead
            </Button>
          </div>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Analytics Cards ── */}
        {isLoadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCardSkeleton count={6} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Leads"  value={stats.total}     icon={<Users className="w-5 h-5"/>} />
            <StatCard title="New"          value={stats.newCount}  icon={<AlertCircle className="w-5 h-5"/>} subtitle="Awaiting contact" />
            <StatCard title="Contacted"    value={stats.contacted} icon={<MessageSquare className="w-5 h-5"/>} />
            <StatCard title="Converted"    value={stats.converted} icon={<UserCheck className="w-5 h-5"/>} />
            <StatCard title="Lost"         value={stats.lost}      icon={<UserX className="w-5 h-5"/>} />
            <StatCard title="Conv. Rate"   value={`${stats.rate}%`} icon={<TrendingUp className="w-5 h-5"/>} subtitle="Converted / Total" />
          </div>
        )}

        {/* ── Search & Filters ── */}
        <FilterContainer>
          {/* Search Bar with Theme Icon on Left */}
          <FilterSearch
            value={search}
            onChange={handleSearchChange}
            placeholder="SEARCH LEADS BY NAME, CONTACT, PHONE, EMAIL..."
            wrapperClassName="flex-1 min-w-[280px]"
          />

          {/* Follow-up Date picker */}
          <FilterDate
            label="FOLLOW UP"
            value={filterFollowUp}
            onChange={handleFollowUpFilterChange}
            wrapperClassName="w-full sm:w-56 shrink-0"
          />

          {/* FROM Creation Date picker */}
          <FilterDate
            label="FROM"
            value={fromDate}
            onChange={(val) => { setFromDate(val); setPage(1); }}
            wrapperClassName="w-full sm:w-48 shrink-0"
          />

          {/* TO Creation Date picker */}
          <FilterDate
            label="TO"
            value={toDate}
            onChange={(val) => { setToDate(val); setPage(1); }}
            wrapperClassName="w-full sm:w-44 shrink-0"
          />

          {/* Status filter */}
          <FilterSelect
            value={filterStatus}
            onChange={handleStatusFilterChange}
            placeholder="ALL STATUSES"
            wrapperClassName="w-full sm:w-36 shrink-0"
            options={[
              { value: 'new', label: 'NEW' },
              { value: 'contacted', label: 'CONTACTED' },
              { value: 'converted', label: 'CONVERTED' },
              { value: 'lost', label: 'LOST' }
            ]}
          />

          {/* Partner filter */}
          <FilterSelect
            value={filterPartner}
            onChange={handlePartnerFilterChange}
            placeholder="ALL PARTNERS"
            searchable={true}
            wrapperClassName="w-full sm:w-40 shrink-0"
            options={partners?.map(p => ({ value: String(p.id), label: p.name })) ?? []}
          />

          {/* Outcome filter */}
          <FilterSelect
            value={filterOutcome}
            onChange={handleOutcomeFilterChange}
            placeholder="ALL OUTCOMES"
            wrapperClassName="w-full sm:w-40 shrink-0"
            options={[
              { value: 'called', label: 'CALLED' },
              { value: 'emailed', label: 'EMAILED' },
              { value: 'whatsapp', label: 'WHATSAPP' },
              { value: 'visited', label: 'VISITED' },
              { value: 'no_answer', label: 'NO ANSWER' }
            ]}
          />

          {/* RESET Button */}
          {hasFilters && (
            <FilterReset onClick={clearFilters} />
          )}
        </FilterContainer>

        {selectedLeadIds.length > 0 && (
          <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-lg p-3 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                {selectedLeadIds.length} leads selected
              </span>
              <button 
                onClick={selectAll}
                className="text-xs font-bold text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 underline decoration-primary-300 dark:decoration-primary-500/50 underline-offset-4"
              >
                {selectedLeadIds.length === paginatedLeads.length ? 'Deselect All' : 'Select All on Page'}
              </button>
            </div>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
              Send Bulk Message
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Pipeline Results
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Showing {paginatedLeads.length} of {totalItems} leads
            </span>
          </div>

          <DataTable 
            data={paginatedLeads}
            columns={columns}
            isLoading={isLoading}
            loadingSkeleton={<TableSkeleton rows={5} cols={6} />}
            onRowClick={(lead) => { setDrawerLead(lead); setIsDrawerOpen(true); }}
            emptyIcon={<Filter className="w-9 h-9 text-slate-300 dark:text-slate-600" />}
            emptyMessage="No leads match your filters. Try adjusting your search or clearing filters."
            searchable={false}
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

      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedLead(null); }}
        lead={selectedLead}
      />
      <LeadDetailDrawer
        lead={drawerLead}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setDrawerLead(null); }}
      />
      <BulkMessageModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedLeadIds={selectedLeadIds}
        onSuccess={() => setSelectedLeadIds([])}
      />

      <DeleteConfirmModal
        isOpen={leadToDelete !== null}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        description="This action cannot be undone. The referral partner lead data and its associated status timeline will be permanently deleted."
        itemName={leadToDelete?.business_name}
        confirmText="DELETE"
      />
    </div>
  );
}
