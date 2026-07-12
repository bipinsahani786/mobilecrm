import React, { useState } from 'react';
import { useSalaryAdvances, useCreateSalaryAdvance } from '../api/useSalaryAdvances';
import { PageHeader } from '@/components/layout/PageHeader';
import { Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/authStore';
import { SalaryAdvanceFormModal } from '../components/SalaryAdvanceFormModal';
import { getAdvanceColumns } from '../constants/advanceColumns';

export default function SalaryAdvancesPage() {
  const { data: advances, isLoading } = useSalaryAdvances();
  const createMutation = useCreateSalaryAdvance();
  const user = useAuthStore(state => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // For this simplified version, salary advances are handled in Payroll generation.
  // We just show them here.

  const columns = getAdvanceColumns();

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Wallet}
        title="Salary Advances"
        subtitle="Manage salary advance requests and deductions"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Request Advance
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex-1">
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={advances || []}
            searchable={true}
            searchKeys={[(req) => req.user?.name || '', 'reason']}
            isLoading={isLoading}
          />
        </div>
      </div>

      <SalaryAdvanceFormModal
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
