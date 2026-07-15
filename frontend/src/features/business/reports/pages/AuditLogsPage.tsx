import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Database, Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuditLogs } from '../api/useAuditLogs';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useStaff } from '../../staff/api/useStaff';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Activity, Edit, Trash2, PlusCircle, ArrowRight } from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const { data: staffList } = useStaff();
  const { data, isLoading } = useAuditLogs({ 
    page, 
    per_page: 20, 
    action: actionFilter || undefined, 
    user_id: userFilter || undefined 
  });

  const columns = [
    {
      header: 'Time',
      cell: (row: any) => format(new Date(row.created_at), 'dd MMM yyyy, hh:mm a'),
    },
    {
      header: 'User',
      cell: (row: any) => row.user?.name || 'System',
    },
    {
      header: 'Action',
      cell: (row: any) => (
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
      accessorKey: 'description',
    },
    {
      header: 'Actions',
      cell: (row: any) => (
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

      <div className="flex-1 p-4 sm:p-6 overflow-auto space-y-6">
        {/* Analytics Cards */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Total Logs</p>
                <h4 className="text-2xl font-bold">{data.stats.total}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Created</p>
                <h4 className="text-2xl font-bold">{data.stats.created}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Updated</p>
                <h4 className="text-2xl font-bold">{data.stats.updated}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Edit className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Deleted</p>
                <h4 className="text-2xl font-bold">{data.stats.deleted}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <div className="w-64">
            <CustomSelect
              options={[{ value: '', label: 'All Staff' }, ...(staffList?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [])]}
              value={userFilter}
              onChange={(val) => { setUserFilter(val); setPage(1); }}
              placeholder="Filter by Staff"
            />
          </div>
          <div className="w-48">
            <CustomSelect
              options={[
                { value: '', label: 'All Actions' },
                { value: 'created', label: 'Created' },
                { value: 'updated', label: 'Updated' },
                { value: 'deleted', label: 'Deleted' },
              ]}
              value={actionFilter}
              onChange={(val) => { setActionFilter(val); setPage(1); }}
              placeholder="Filter by Action"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={data?.data || []} 
            isLoading={isLoading}
            serverSide={true}
            totalItems={data?.total || 0}
            page={page}
            itemsPerPage={20}
            onPageChange={setPage}
          />
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
                <p className="font-medium">
                  {selectedLog.model_type.split('\\').pop()} #{selectedLog.model_id}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-4">
              <p className="text-sm font-medium mb-3">Properties & Data Changes</p>
              {selectedLog.properties ? (
                selectedLog.action === 'updated' && selectedLog.properties.old && selectedLog.properties.new ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 mb-1">
                      <div>Old Values</div>
                      <div>New Values</div>
                    </div>
                    {Object.keys(selectedLog.properties.new).map(key => (
                      <div key={key} className="grid grid-cols-2 gap-2 items-center bg-slate-50 dark:bg-white/5 p-2 rounded">
                        <div className="text-xs text-rose-500 dark:text-rose-400 break-all flex flex-col gap-1">
                          <span className="text-slate-500 dark:text-slate-400 font-medium capitalize">{key.replace(/_/g, ' ')}:</span> 
                          <span>{selectedLog.properties.old[key] === null ? 'None' : String(selectedLog.properties.old[key])}</span>
                        </div>
                        <div className="text-xs text-emerald-500 dark:text-emerald-400 break-all flex flex-col gap-1 relative">
                          <ArrowRight className="w-3 h-3 absolute -left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <span className="text-slate-500 dark:text-slate-400 font-medium capitalize pl-2">{key.replace(/_/g, ' ')}:</span>
                          <span className="pl-2 font-medium">{selectedLog.properties.new[key] === null ? 'None' : String(selectedLog.properties.new[key])}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedLog.properties.attributes || selectedLog.properties.old || selectedLog.properties).map(([key, value]) => (
                       <div key={key} className="flex flex-col sm:flex-row sm:items-center bg-slate-50 dark:bg-white/5 p-2 rounded gap-2 text-xs">
                         <span className="text-slate-500 dark:text-slate-400 font-medium capitalize w-32 shrink-0">{key.replace(/_/g, ' ')}</span>
                         <span className="text-slate-700 dark:text-slate-300 font-medium break-all">{value === null ? 'None' : String(value)}</span>
                       </div>
                    ))}
                  </div>
                )
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
