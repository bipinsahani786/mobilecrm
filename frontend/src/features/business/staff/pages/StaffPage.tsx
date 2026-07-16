import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStaff, useUpdateStaff } from '../api/useStaff';
import { PageHeader } from '@/components/layout/PageHeader';
import { Users, Plus, TrendingUp, IndianRupee, Search, X, ShieldAlert, Download } from 'lucide-react';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getStaffColumns } from '../constants/staffColumns';
import { StaffFormModal } from '@/features/business/staff/components/StaffFormModal';
import { PermissionsModal } from '@/features/business/staff/components/PermissionsModal';
import { useNavigate } from 'react-router-dom';
import { FilterContainer, FilterSearch, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { formatCurrency } from '@/lib/formatters';
import { exportToCsv } from '@/utils/exportToCsv';

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

  const activeStaffCount = (staff || []).filter(s => s.status === 'active').length;
  const totalSalary = (staff || []).filter(s => s.status === 'active').reduce((acc, s) => acc + (Number(s.monthly_salary) || 0), 0);

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

  const handleExport = () => {
    exportToCsv(filteredStaff, columns as any, 'staff_list');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-4">

        {/* Compact Top Control Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            {/* Mini Card 1 - Active Staff */}
            <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl px-6 py-3.5 min-w-[200px] shadow-lg shadow-primary-500/20 shrink-0">
              {/* Background Shapes */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-6 -mt-6 mix-blend-overlay" />
              <div className="absolute bottom-0 right-10 w-10 h-10 bg-black/10 rounded-full -mb-3 mix-blend-overlay" />
              
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Active Staff</p>
                <p className="text-base font-black text-white leading-tight drop-shadow-sm">{activeStaffCount}</p>
              </div>
            </div>

            {/* Mini Card 2 - Payroll */}
            <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl px-6 py-3.5 min-w-[200px] shadow-lg shadow-primary-600/20 shrink-0">
              {/* Background Shapes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white/10 rotate-45 mix-blend-overlay" />
              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/20 rounded-full mix-blend-overlay" />

              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Payroll</p>
                <p className="text-base font-black text-white leading-tight drop-shadow-sm">{formatCurrency(totalSalary)}</p>
              </div>
            </div>

            {/* Mini Card 3 - Total Staff */}
            <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl px-6 py-3.5 min-w-[200px] shadow-lg shadow-primary-400/20 shrink-0">
              {/* Background Shapes */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[80px] border-l-transparent border-t-[80px] border-white/20 mix-blend-overlay" />
              <div className="absolute bottom-0 right-1/4 w-12 h-12 bg-black/10 rounded-full -mb-5 mix-blend-overlay" />

              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Total Staff</p>
                <p className="text-base font-black text-white leading-tight drop-shadow-sm">{staff?.length || 0}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setSelectedStaff(null); setIsFormOpen(true); }}
            className="shrink-0 flex items-center gap-2 h-10 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-xs shadow-sm shadow-primary-500/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative z-30">
          <FilterContainer className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-grow">
              {/* Row 1: Search + Export on mobile, or normal search on desktop */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-grow">
                <FilterSearch
                  value={search}
                  onChange={(val) => setSearch(val)}
                  placeholder="Search staff by name or phone..."
                  wrapperClassName="flex-grow h-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]"
                />
                <button
                  onClick={handleExport}
                  className="inline-flex md:hidden items-center justify-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-primary-500" />
                  <span>Export</span>
                </button>
              </div>

              {/* Row 2: both filter dropdowns side-by-side on mobile, or next to search on desktop */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <FilterSelect
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="All Roles"
                  options={[
                    { value: 'staff', label: 'Staff (Sales)' },
                    { value: 'manager', label: 'Manager' }
                  ]}
                  wrapperClassName="flex-grow md:flex-none w-1/2 md:w-44 shrink-0"
                />

                <FilterSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Statuses"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                  wrapperClassName="flex-grow md:flex-none w-1/2 md:w-44 shrink-0"
                />

                <button
                  onClick={handleExport}
                  className="hidden md:inline-flex items-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-primary-500" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {(search || roleFilter || statusFilter) && (
              <FilterReset
                onClick={handleClearFilters}
              />
            )}
          </FilterContainer>
        </div>

        {/* Data Table */}
        <div className="relative z-10 bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm">
          <DataTable
            columns={columns}
            data={filteredStaff}
            searchable={false}
            isLoading={isLoading}
            exportable={false}
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
