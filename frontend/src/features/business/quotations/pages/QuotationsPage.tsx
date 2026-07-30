import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, TrendingUp, Download, Search, ArrowRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useQuotations, useDeleteQuotation, useConvertToBill } from '../api/useQuotations';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterContainer, FilterSearch, FilterSelect, FilterReset, FilterDate } from '@/components/ui/filter-controls';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import type { Quotation } from '../schemas/quotationSchema';
import { toast } from 'sonner';
import api from '@/lib/api';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  sent: { label: 'Sent', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  rejected: { label: 'Rejected', cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
  converted: { label: 'Converted', cls: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400' },
};

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);

  const { data: response, isLoading } = useQuotations(page, 15, {
    search: search || undefined,
    status: status || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const deleteMutation = useDeleteQuotation();
  const convertMutation = useConvertToBill();

  const quotations = response?.data || [];
  const meta = response?.meta;
  const totalQuotations = meta?.total || 0;

  const handleDownloadPdf = async (quotation: Quotation, withLetterhead: boolean) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      const res = await api.get(`/business/quotations/${quotation.id}/pdf?header=${withLetterhead}&footer=${withLetterhead}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${quotation.quotation_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully', { id: 'pdf-download' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf-download' });
    }
  };

  const handleConvertToBill = async (quotation: Quotation) => {
    if (quotation.status === 'converted') {
      toast.error('This quotation has already been converted');
      return;
    }
    try {
      toast.loading('Converting to bill...', { id: 'convert-bill' });
      const result = await convertMutation.mutateAsync(quotation.id);
      toast.success(`Quotation converted! Invoice: ${result.sale?.invoice_number}`, { id: 'convert-bill' });
      navigate(`/invoices/${result.sale?.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to convert', { id: 'convert-bill' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!quotationToDelete) return;
    try {
      await deleteMutation.mutateAsync(quotationToDelete.id);
      toast.success('Quotation deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      header: 'Quotation',
      cell: (q) => (
        <div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">{q.quotation_number}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(q.date).toLocaleDateString()}</p>
        </div>
      )
    },
    {
      header: 'Customer',
      cell: (q) => (
        <div>
          {q.customer ? (
            <p className="font-bold text-xs text-slate-900 dark:text-white">{q.customer.name}</p>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 italic">Walk-in</span>
          )}
        </div>
      )
    },
    {
      header: 'Items',
      cell: (q) => (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {q.items?.length || 0} Items
        </span>
      )
    },
    {
      header: 'Amount',
      className: 'text-right',
      cell: (q) => (
        <span className="font-black text-sm text-slate-900 dark:text-white">
          {formatCurrency(q.final_amount)}
        </span>
      )
    },
    {
      header: 'Valid Until',
      cell: (q) => (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (q) => {
        const cfg = statusConfig[q.status] || statusConfig.draft;
        return (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${cfg.cls}`}>
            {cfg.label}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      cell: (q) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/quotations/${q.id}`); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="View"
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownloadPdf(q, true); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
          </button>
          {q.status !== 'converted' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleConvertToBill(q); }}
              className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
              title="Convert to Bill"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </button>
          )}
          {q.status !== 'converted' && (
            <button
              onClick={(e) => { e.stopPropagation(); setQuotationToDelete(q); }}
              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-200">
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] animate-float2" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6 z-20">

        {/* Header */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-4xl">
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Quotations"
                  value={totalQuotations}
                  icon={<FileText />}
                  glowColor="primary"
                  subtitle="All quotations"
                />
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button
                onClick={() => navigate('/quotations/new')}
                className="group relative flex items-center gap-3 h-12 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">New Quotation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterContainer className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <FilterSearch
              value={search}
              onChange={setSearch}
              placeholder="SEARCH BY QUOTATION #, CUSTOMER..."
              wrapperClassName="flex-1 min-w-[200px] h-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]"
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              placeholder="All Status"
              options={statusOptions}
              wrapperClassName="w-full sm:w-40 shrink-0"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
              <FilterDate label="From" value={startDate} onChange={setStartDate} placeholder="Start Date" />
              <span className="text-slate-400 text-xs font-bold text-center hidden sm:inline px-0.5">to</span>
              <FilterDate label="To" value={endDate} onChange={setEndDate} placeholder="End Date" />
            </div>
          </div>

          {(search || status || startDate || endDate) && (
            <FilterReset onClick={() => { setSearch(''); setStatus(''); setStartDate(''); setEndDate(''); setPage(1); }} />
          )}
        </FilterContainer>

        <DataTable
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton />}
          columns={columns}
          data={quotations}
          pagination={{
            currentPage: meta?.current_page || 1,
            totalPages: meta?.last_page || 1,
            onPageChange: setPage
          }}
          onRowClick={(q) => navigate(`/quotations/${q.id}`)}
          emptyMessage="No quotations found for these filters"
        />
      </div>

      <DeleteConfirmModal
        isOpen={!!quotationToDelete}
        onClose={() => setQuotationToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Quotation"
        description={`Are you sure you want to delete quotation ${quotationToDelete?.quotation_number}?`}
      />
    </div>
  );
}
