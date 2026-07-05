import React, { useState } from 'react';
import { useMessageLogs } from '../api/useMessageLogs';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { Activity, Mail, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { format } from 'date-fns';

export default function MessageLogsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useMessageLogs({ page, per_page: perPage, type: typeFilter, status: statusFilter });

  const logs = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;

  const columns: ColumnDef<any>[] = [
    {
      header: 'Date & Time',
      cell: (log) => (
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm a')}
        </span>
      ),
    },
    {
      header: 'Lead',
      cell: (log) => (
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {log.lead?.business_name || 'Unknown Business'}
          </p>
          <p className="text-xs text-slate-500">
            {log.lead?.contact_person || 'Unknown Person'}
          </p>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (log) => (
        <div className="text-xs text-slate-500">
          {log.type === 'email' ? log.lead?.email || 'No email' : log.lead?.phone || 'No phone'}
        </div>
      ),
    },
    {
      header: 'Template',
      cell: (log) => (
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-md text-slate-600 dark:text-slate-300">
          {log.template?.name || 'Deleted Template'}
        </span>
      ),
    },
    {
      header: 'Channel',
      cell: (log) => (
        <div className="flex items-center gap-1.5">
          {log.type === 'email' ? (
            <Mail className="w-3.5 h-3.5 text-blue-500" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {log.type}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (log) => (
        <div className="flex items-center gap-1.5">
          {log.status === 'sent' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {log.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-500" />}
          {log.status === 'pending' && <Activity className="w-4 h-4 text-amber-500" />}
          <div className="flex flex-col">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              log.status === 'sent' ? 'text-emerald-600 dark:text-emerald-400' : 
              log.status === 'failed' ? 'text-rose-600 dark:text-rose-400' : 
              'text-amber-600 dark:text-amber-400'
            }`}>
              {log.status}
            </span>
            {log.error_message && (
              <span className="text-[10px] text-rose-500 mt-0.5 truncate max-w-[150px]" title={log.error_message}>
                {log.error_message}
              </span>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Activity}
        title="Campaign Logs"
        subtitle="Track bulk message delivery status and history."
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm relative z-10">
          <select 
            value={typeFilter} 
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium w-full md:w-48"
          >
            <option value="">All Channels</option>
            <option value="email">Email Only</option>
            <option value="whatsapp">WhatsApp Only</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium w-full md:w-48"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent Successfully</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            data={logs}
            columns={columns}
            isLoading={isLoading}
            loadingSkeleton={<TableSkeleton rows={10} cols={6} />}
            emptyMessage="No message logs found."
            serverSide
            totalItems={totalItems}
            page={page}
            itemsPerPage={perPage}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPerPage(size); setPage(1); }}
          />
        </div>
      </div>
    </div>
  );
}
