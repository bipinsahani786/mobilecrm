import React, { useState, useMemo } from 'react';
import { useLeaveRequests, useCreateLeaveRequest, useUpdateLeaveStatus } from '../api/useLeaveRequests';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/authStore';
import { LeaveRequestFormModal } from '../components/LeaveRequestFormModal';
import { getLeaveColumns } from '../constants/leaveColumns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterContainer, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { useStaff } from '../../staff/api/useStaff';

export default function LeaveRequestsPage() {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: requests, isLoading } = useLeaveRequests();
  const createMutation = useCreateLeaveRequest();
  const updateStatusMutation = useUpdateLeaveStatus();
  const user = useAuthStore(state => state.user);
  const { data: staffList, isLoading: isStaffLoading } = useStaff();

  const isManager = user?.roles?.some(r => 
    r.name === 'admin' || 
    r.name === 'manager' || 
    r.name === 'Business Admin' || 
    r.name === 'Superadmin'
  );

  const columns = getLeaveColumns({ isManager, updateStatusMutation });

  // Compute analytics
  const stats = useMemo(() => {
    if (!requests) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      total: requests.length,
      pending: requests.filter((r: any) => r.status === 'pending').length,
      approved: requests.filter((r: any) => r.status === 'approved').length,
      rejected: requests.filter((r: any) => r.status === 'rejected').length,
    };
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let filtered = requests;

    if (selectedStaff !== '') {
      filtered = filtered.filter((r: any) => r.user_id.toString() === selectedStaff);
    }
    
    if (selectedStatus !== '') {
      filtered = filtered.filter((r: any) => r.status === selectedStatus);
    }

    return filtered;
  }, [requests, selectedStaff, selectedStatus]);

  const handleResetFilters = () => {
    setSelectedStaff('');
    setSelectedStatus('');
  };

  const hasActiveFilters = selectedStaff !== '' || selectedStatus !== '';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Calendar}
        title="Leave Requests"
        subtitle="Manage employee time off and leave requests"
      />

      <div className="w-full max-w-[1600px] px-4 pt-0 pb-4 space-y-4 flex-1">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CustomKpiCard
            title="Total Requests"
            value={stats.total}
            icon={<Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
            glowColor="indigo"
          />
          <CustomKpiCard
            title="Pending Approval"
            value={stats.pending}
            icon={<Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
            glowColor="amber"
          />
          <CustomKpiCard
            title="Approved Leaves"
            value={stats.approved}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
            glowColor="emerald"
          />
          <CustomKpiCard
            title="Rejected Leaves"
            value={stats.rejected}
            icon={<XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
            glowColor="rose"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm p-4 relative z-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4 flex-1">
              {isManager && (
                <div className="w-full sm:w-60 shrink-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                    Staff Member
                  </label>
                  <FilterSelect
                    value={selectedStaff}
                    onChange={setSelectedStaff}
                    placeholder="All Staff"
                    searchable={true}
                    options={staffList?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || []}
                    wrapperClassName="w-full"
                  />
                </div>
              )}
              
              <div className="w-full sm:w-48 shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Status
                </label>
                <FilterSelect
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="All Status"
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                  wrapperClassName="w-full"
                />
              </div>

              {hasActiveFilters && (
                <FilterReset onClick={handleResetFilters} />
              )}
            </div>

            {!isManager && (
              <div className="shrink-0">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group relative flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer w-full sm:w-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Request Leave</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden relative z-10">
          <DataTable
            columns={columns}
            data={filteredRequests}
            searchable={true}
            searchKeys={[(req) => req.user?.name || '', 'leave_type', 'reason']}
            isLoading={isLoading || (isManager && isStaffLoading)}
          />
        </div>
      </div>

      <LeaveRequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          createMutation.mutate(data as any, {
            onSuccess: () => setIsModalOpen(false)
          });
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
