import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Database, Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuditLogs } from '../api/useAuditLogs';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading } = useAuditLogs({ page, per_page: 20 });

  const columns = [
    {
      header: 'Time',
      accessor: (row: any) => format(new Date(row.created_at), 'dd MMM yyyy, hh:mm a'),
    },
    {
      header: 'User',
      accessor: (row: any) => row.user?.name || 'System',
    },
    {
      header: 'Action',
      accessor: (row: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.action === 'created' ? 'bg-emerald-100 text-emerald-700' :
          row.action === 'updated' ? 'bg-amber-100 text-amber-700' :
          row.action === 'deleted' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
        }`}>
          {row.action.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(row)}>
          <Eye className="w-4 h-4 mr-2" /> View Details
        </Button>
      ),
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Database}
        title="System Audit Logs"
        subtitle="Track and monitor system-wide data changes and activities"
      />

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={data?.data || []} 
            isLoading={isLoading}
          />

          {/* Pagination */}
          {data?.last_page > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing {data.from} to {data.to} of {data.total} entries
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === data.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        title="Audit Log Details"
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-slate-500">Time</p>
                <p className="font-medium">{format(new Date(selectedLog.created_at), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
              <div>
                <p className="text-slate-500">User</p>
                <p className="font-medium">{selectedLog.user?.name || 'System'} ({selectedLog.user?.email || 'N/A'})</p>
              </div>
              <div>
                <p className="text-slate-500">Action</p>
                <p className="font-medium uppercase">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-slate-500">Model</p>
                <p className="font-medium">{selectedLog.model_type} #{selectedLog.model_id}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-4">
              <p className="text-sm font-medium mb-2">Properties & Data Changes</p>
              {selectedLog.properties ? (
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[400px] text-xs font-mono">
                  <pre>{JSON.stringify(selectedLog.properties, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No properties recorded for this action.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
