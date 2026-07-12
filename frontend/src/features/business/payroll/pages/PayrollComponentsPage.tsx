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
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
           <PayrollComponentsSettings />
        </div>
      </div>
    </div>
  );
}
