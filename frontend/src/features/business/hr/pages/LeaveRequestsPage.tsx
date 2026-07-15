import React, { useState } from 'react';
import { useLeaveRequests, useCreateLeaveRequest, useUpdateLeaveStatus } from '../api/useLeaveRequests';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/authStore';
import { LeaveRequestFormModal } from '../components/LeaveRequestFormModal';
import { getLeaveColumns } from '../constants/leaveColumns';

export default function LeaveRequestsPage() {
  const { data: requests, isLoading } = useLeaveRequests();
  const createMutation = useCreateLeaveRequest();
  const updateStatusMutation = useUpdateLeaveStatus();
  const user = useAuthStore(state => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isManager = user?.roles?.some(r => 
    r.name === 'admin' || 
    r.name === 'manager' || 
    r.name === 'Business Admin' || 
    r.name === 'Superadmin'
  );

  const columns = getLeaveColumns({ isManager, updateStatusMutation });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Calendar}
        title="Leave Requests"
        subtitle="Manage employee time off and leave requests"
        actions={
          !isManager && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group relative flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Leave</span>
            </button>
          )
        }
      />

      <div className="w-full max-w-[1600px] px-4 pt-0 pb-4 space-y-4 flex-1">
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={requests || []}
            searchable={true}
            searchKeys={[(req) => req.user?.name || '', 'leave_type']}
            isLoading={isLoading}
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
