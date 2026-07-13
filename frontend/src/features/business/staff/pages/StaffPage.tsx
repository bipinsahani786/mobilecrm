import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStaff, useUpdateStaff } from '../api/useStaff';
import { PageHeader } from '@/components/layout/PageHeader';
import { Users, Plus, TrendingUp, IndianRupee, Search, X, ShieldAlert } from 'lucide-react';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getStaffColumns } from '../constants/staffColumns';
import { StaffFormModal } from '@/features/business/staff/components/StaffFormModal';
import { PermissionsModal } from '@/features/business/staff/components/PermissionsModal';
import { useNavigate } from 'react-router-dom';
import { FilterContainer, FilterSearch, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { formatCurrency } from '@/lib/formatters';

export default function StaffPage() {
  const { data: staff, isLoading } = useStaff();
  const updateMutation = useUpdateStaff();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const columns = getStaffColumns({ 
    handleEdit, 
    handleToggleStatus, 
    handlePermissions, 
    handleViewDetails: (e, staffMember) => {
      e.stopPropagation();
      navigate(`/staff/${staffMember.id}`);
    },
    currentUser: user 
  });

  const activeStaffCount = staff?.filter(s => s.status === 'active').length || 0;
  const totalSalary = staff?.filter(s => s.status === 'active').reduce((acc, s) => acc + Number(s.monthly_salary), 0) || 0;

  // Filter staff locally based on search term, role, and status
  const filteredStaff = useMemo(() => {
    let result = staff || [];

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(s => 
        s.name.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term))
      );
    }

    if (roleFilter) {
      result = result.filter(s => s.role === roleFilter);
    }

    if (statusFilter) {
      result = result.filter(s => s.status === statusFilter);
    }

    return result;
  }, [staff, search, roleFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader
        icon={Users}
        title="Staff Management"
        subtitle="Manage your employees, salary, and commissions"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Premium Control Panel */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Active Staff"
                  value={activeStaffCount}
                  icon={<Users />}
                  glowColor="primary"
                  subtitle="Staff currently working"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Monthly Salary"
                  value={formatCurrency(totalSalary)}
                  icon={<IndianRupee />}
                  glowColor="primary"
                  subtitle="Active staff payroll"
                />
              </div>
              <div className="flex-1 transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Staff"
                  value={staff?.length || 0}
                  icon={<TrendingUp />}
                  glowColor="primary"
                  subtitle={`${staff?.filter(s => s.status === 'inactive').length || 0} inactive members`}
                />
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button 
                onClick={() => { setSelectedStaff(null); setIsFormOpen(true); }}
                className="group relative flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden w-full sm:w-auto justify-center"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add Staff</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <FilterContainer className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <FilterSearch
              value={search}
              onChange={(val) => setSearch(val)}
              placeholder="Search staff by name or phone..."
              wrapperClassName="flex-1 min-w-[200px] h-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]"
            />
            
            <FilterSelect
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="All Roles"
              options={[
                { value: 'staff', label: 'Staff (Sales)' },
                { value: 'manager', label: 'Manager' }
              ]}
              wrapperClassName="w-full sm:w-44 shrink-0"
            />

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              wrapperClassName="w-full sm:w-44 shrink-0"
            />
          </div>

          {(search || roleFilter || statusFilter) && (
            <FilterReset
              onClick={handleClearFilters}
            />
          )}
        </FilterContainer>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredStaff}
            searchable={false}
            isLoading={isLoading}
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
