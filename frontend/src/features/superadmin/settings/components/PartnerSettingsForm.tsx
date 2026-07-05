import { useFormContext } from 'react-hook-form';
import { Briefcase, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SettingsFormValues } from '../schemas/settingsSchema';

interface PartnerSettingsFormProps {
  isPending: boolean;
  onSubmit: (data: SettingsFormValues) => void;
}

export function PartnerSettingsForm({ isPending, onSubmit }: PartnerSettingsFormProps) {
  const form = useFormContext<SettingsFormValues>();

  return (
    <div className="lg:col-span-3 bg-white/70 dark:bg-[#111115]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-500/20 shadow-inner">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Partner Program</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Configure default commission for new partners</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Commission Type */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">
              Commission Type
            </label>
            <select
              {...form.register('partner_commission_type')}
              className="w-full h-12 px-4 bg-slate-50/50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
            {form.formState.errors.partner_commission_type && (
              <p className="text-xs text-rose-500 font-bold ml-1">{form.formState.errors.partner_commission_type.message}</p>
            )}
          </div>

          {/* Commission Value */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">
              Default Commission
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold pointer-events-none">
                {form.watch('partner_commission_type') === 'percentage' ? '%' : '₹'}
              </span>
              <Input
                type="number"
                step="0.01"
                {...form.register('partner_commission_value')}
                className="h-12 pl-10 bg-slate-50/50 dark:bg-[#0a0a0c] border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
              />
            </div>
            {form.formState.errors.partner_commission_value && (
              <p className="text-xs text-rose-500 font-bold ml-1">{form.formState.errors.partner_commission_value.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 h-12 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
