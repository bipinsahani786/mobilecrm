import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Settings2 } from 'lucide-react';
import { PayrollComponentsSettings } from '../components/PayrollComponentsSettings';

export default function PayrollComponentsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Settings2}
        title="Payroll Components"
        subtitle="Manage dynamic salary earnings and deductions."
      />
      <div className="w-full px-4 pt-0 pb-4 max-w-4xl">
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl p-4 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm">
           <PayrollComponentsSettings />
        </div>
      </div>
    </div>
  );
}
