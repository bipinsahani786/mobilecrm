import { useFormContext } from 'react-hook-form';
import { Building2, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SettingsFormValues } from '../schemas/settingsSchema';

interface BrandIdentityFormProps {
  isPending: boolean;
  onSubmit: (data: SettingsFormValues) => void;
}

export function BrandIdentityForm({ isPending, onSubmit }: BrandIdentityFormProps) {
  const form = useFormContext<SettingsFormValues>();

  return (
    <div className="lg:col-span-3 bg-white/70 dark:bg-[#111115]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-500/20 shadow-inner">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Brand Identity</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Update platform name and presentation</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          {/* App Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
              <Building2 className="w-3.5 h-3.5" /> Platform Name
            </label>
            <Input
              {...form.register('app_name')}
              placeholder="e.g. MobileCRM"
              className="h-12 bg-slate-50/50 dark:bg-[#0a0a0c] border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
            />
            {form.formState.errors.app_name && (
              <p className="text-xs text-rose-500 font-bold ml-1">{form.formState.errors.app_name.message}</p>
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
