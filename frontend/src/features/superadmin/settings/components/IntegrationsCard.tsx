import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IntegrationsCard() {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Email Configuration (SMTP)</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">For transactional & bulk emails</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Mail className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <p className="text-xs text-slate-500 font-medium">To configure your SMTP settings, please update your server's <code className="bg-slate-200 dark:bg-white/10 px-1 rounded text-slate-700 dark:text-slate-300">.env</code> file directly for security reasons. Future updates will allow editing here.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">WhatsApp API Integration</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">For bulk WhatsApp marketing</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <p className="text-xs text-slate-500 font-medium mb-3">WhatsApp API credentials will be stored securely. Currently, messages are simulated in the background for testing.</p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Configure Keys (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
