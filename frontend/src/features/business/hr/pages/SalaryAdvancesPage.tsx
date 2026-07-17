import React, { useState, useMemo } from 'react';
import { useSalaryAdvances, useCreateSalaryAdvance, useUpdateSalaryAdvanceStatus } from '../api/useSalaryAdvances';
import { PageHeader } from '@/components/layout/PageHeader';
import { Wallet, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/authStore';
import { SalaryAdvanceFormModal } from '../components/SalaryAdvanceFormModal';
import { getAdvanceColumns } from '../constants/advanceColumns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { useStaff } from '../../staff/api/useStaff';

export default function SalaryAdvancesPage() {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: advances, isLoading } = useSalaryAdvances();
  const createMutation = useCreateSalaryAdvance();
  const updateStatusMutation = useUpdateSalaryAdvanceStatus();
  const user = useAuthStore(state => state.user);
  const { data: staffList } = useStaff();

  const isManager = user?.roles?.some((r: any) => 
    r.name === 'admin' || 
    r.name === 'manager' || 
    r.name === 'Business Admin' || 
    r.name === 'Superadmin'
  );

  const columns = getAdvanceColumns({ isManager, updateStatusMutation });

  // Compute analytics
  const stats = useMemo(() => {
    if (!advances) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      total: advances.length,
      pending: advances.filter((r: any) => r.status === 'pending').length,
      approved: advances.filter((r: any) => r.status === 'approved').length,
      rejected: advances.filter((r: any) => r.status === 'rejected').length,
    };
  }, [advances]);

  // Filter requests
  const filteredAdvances = useMemo(() => {
    if (!advances) return [];
    let filtered = advances;

    if (selectedStaff !== '') {
      filtered = filtered.filter((r: any) => r.user_id.toString() === selectedStaff);
    }
    
    if (selectedStatus !== '') {
      filtered = filtered.filter((r: any) => r.status === selectedStatus);
    }

    return filtered;
  }, [advances, selectedStaff, selectedStatus]);

  const handleResetFilters = () => {
    setSelectedStaff('');
    setSelectedStatus('');
  };

  const hasActiveFilters = selectedStaff !== '' || selectedStatus !== '';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Wallet}
        title="Salary Advances"
        subtitle="Manage salary advance requests and deductions"
      />

      <div className="w-full max-w-[1600px] px-4 pt-0 pb-4 space-y-4 flex-1">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CustomKpiCard
            title="Total Requests"
            value={stats.total}
            icon={<Wallet className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
            glowColor="indigo"
          />
          <CustomKpiCard
            title="Pending Approval"
            value={stats.pending}
            icon={<Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
            glowColor="amber"
          />
          <CustomKpiCard
            title="Approved Advances"
            value={stats.approved}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
            glowColor="emerald"
          />
          <CustomKpiCard
            title="Rejected Advances"
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
                  <span>Request Advance</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden z-10">
          <DataTable
            columns={columns}
            data={filteredAdvances || []}
            searchable={true}
            searchKeys={[(req) => req.user?.name || '', 'notes']}
            isLoading={isLoading}
          />
        </div>
      </div>

      <SalaryAdvanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          if (!user?.id) return;
          createMutation.mutate({
            user_id: user.id,
            amount: data.amount,
            given_date: data.date,
            notes: data.reason
          } as any, {
            onSuccess: () => setIsModalOpen(false)
          });
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
