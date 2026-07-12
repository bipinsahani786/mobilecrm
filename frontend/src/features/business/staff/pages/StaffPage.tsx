import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Toggle } from '@/components/ui/toggle';
import { useStaff, useUpdateStaff } from '../api/useStaff';
import { PageHeader } from '@/components/layout/PageHeader';
import { Users, Plus, TrendingUp, IndianRupee } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getStaffColumns } from '../constants/staffColumns';
import { StaffFormModal } from '@/features/business/staff/components/StaffFormModal';
import { PermissionsModal } from '@/features/business/staff/components/PermissionsModal';
import { useNavigate } from 'react-router-dom';

export default function StaffPage() {
  const { data: staff, isLoading } = useStaff();
  const updateMutation = useUpdateStaff();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const handleEdit = (e: React.MouseEvent, staffMember: any) => {
    e.stopPropagation();
    setSelectedStaff(staffMember);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (staffMember: any) => {
    const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate({ id: staffMember.id, status: newStatus });
  };

  const handlePermissions = (e: React.MouseEvent, staffMember: any) => {
    e.stopPropagation();
    setSelectedStaff(staffMember);
    setIsPermissionsOpen(true);
  };

  const columns = getStaffColumns({ handleEdit, handleToggleStatus, handlePermissions, currentUser: user });

  const activeStaffCount = staff?.filter(s => s.status === 'active').length || 0;
  const totalSalary = staff?.filter(s => s.status === 'active').reduce((acc, s) => acc + Number(s.monthly_salary), 0) || 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader
        icon={Users}
        title="Staff Management"
        subtitle="Manage your employees, salary, and commissions"
        actions={
          <Button size="sm" onClick={() => { setSelectedStaff(null); setIsFormOpen(true); }}>
            <Plus size={14} className="mr-2" /> Add Staff
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Active Staff"
            value={activeStaffCount}
            icon={Users}
          />
          <StatCard
            title="Total Monthly Salary"
            value={`₹${totalSalary.toLocaleString()}`}
            icon={IndianRupee}
            subtitle="Active staff only"
          />
          <StatCard
            title="Total Staff"
            value={staff?.length || 0}
            icon={TrendingUp}
            subtitle={`${staff?.filter(s => s.status === 'inactive').length || 0} inactive`}
          />
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={staff || []}
            searchable={true}
            searchKeys={['name', 'phone', 'email', 'role']}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/staff/${row.id}`)}
            exportable={true}
            exportFilename="staff_list"
          />
        </div>
      </div>

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        staff={selectedStaff}
      />

      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        staff={selectedStaff}
      />
    </div>
  );
}
