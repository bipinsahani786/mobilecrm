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
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Request Leave
            </Button>
          )
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex-1">
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
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
