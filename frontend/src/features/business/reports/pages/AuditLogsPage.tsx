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
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { SearchableSelect } from '@/components/ui/searchable-select';

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      
      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <PageHeader 
          icon={Database}
          title="System Audit Logs"
          subtitle="Track and monitor system-wide data changes and activities"
        />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6">
          
          {/* Analytics KPI Cards */}
          {data?.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CustomKpiCard
                title="Total Logs"
                value={data.stats.total}
                subtitle="Audit track records"
                icon={<Activity />}
                glowColor="indigo"
              />
              <CustomKpiCard
                title="Created"
                value={data.stats.created}
                subtitle="Records added"
                icon={<PlusCircle />}
                glowColor="emerald"
              />
              <CustomKpiCard
                title="Updated"
                value={data.stats.updated}
                subtitle="Records modified"
                icon={<Edit />}
                glowColor="amber"
              />
              <CustomKpiCard
                title="Deleted"
                value={data.stats.deleted}
                subtitle="Records removed"
                icon={<Trash2 />}
                glowColor="rose"
              />
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-6 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Staff</span>
              <SearchableSelect
                options={[{ value: '', label: 'All Staff' }, ...(staffList?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [])]}
                value={userFilter}
                onChange={(val) => { setUserFilter(String(val)); setPage(1); }}
                placeholder="Filter by Staff"
                className="w-56"
                controlSize="sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Action</span>
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
                className="w-48"
              />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
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
      </div>

      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        title="Audit Log Details"
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50/50 dark:bg-zinc-900/50 p-4 border border-slate-200/50 dark:border-white/5 rounded-xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-zinc-500 mb-1">Time</p>
                <p className="font-semibold text-slate-900 dark:text-white">{format(new Date(selectedLog.created_at), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-zinc-500 mb-1">User</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedLog.user?.name || 'System'}</p>
                <p className="text-[10px] text-slate-500 font-medium">{selectedLog.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-zinc-500 mb-1">Action</p>
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                  selectedLog.action === 'created' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  selectedLog.action === 'updated' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  selectedLog.action === 'deleted' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-slate-500/10 text-slate-600'
                }`}>
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-zinc-500 mb-1">Target Model</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedLog.model_type.split('\\').pop()} <span className="text-zinc-400 font-medium">#{selectedLog.model_id}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4">Properties & Data Changes</p>
              {selectedLog.properties ? (
                selectedLog.action === 'updated' && selectedLog.properties.old && selectedLog.properties.new ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <div>Old Values</div>
                      <div>New Values</div>
                    </div>
                    {Object.keys(selectedLog.properties.new).map(key => (
                      <div key={key} className="grid grid-cols-2 gap-3 items-center bg-slate-50/50 dark:bg-zinc-900/40 p-3 border border-slate-100 dark:border-white/5 rounded-xl">
                        <div className="text-xs text-rose-600 dark:text-rose-400 break-all flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span> 
                          <span className="font-medium">{selectedLog.properties.old[key] === null ? 'None' : String(selectedLog.properties.old[key])}</span>
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 break-all flex flex-col gap-1 relative pl-2">
                          <ArrowRight className="w-3.5 h-3.5 absolute -left-2 top-1/2 -translate-y-1/2 text-slate-350 dark:text-zinc-600" />
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold">{selectedLog.properties.new[key] === null ? 'None' : String(selectedLog.properties.new[key])}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedLog.properties.attributes || selectedLog.properties.old || selectedLog.properties).map(([key, value]) => (
                       <div key={key} className="flex flex-col sm:flex-row sm:items-center bg-slate-50/50 dark:bg-zinc-900/40 p-3 border border-slate-100 dark:border-white/5 rounded-xl gap-2 text-xs">
                         <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest w-32 shrink-0">{key.replace(/_/g, ' ')}</span>
                         <span className="text-slate-700 dark:text-slate-300 font-semibold break-all">{value === null ? 'None' : String(value)}</span>
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
