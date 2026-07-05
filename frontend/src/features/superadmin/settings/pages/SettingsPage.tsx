import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Settings } from 'lucide-react';
import { usePublicSettings, useUpdateSettings } from '../api/useSettings';
import { useAppStore } from '@/store/appStore';
import { Skeleton } from '@/components/ui/skeleton';

import { settingsSchema, type SettingsFormValues } from '../schemas/settingsSchema';
import { BrandIdentityForm } from '../components/BrandIdentityForm';
import { PartnerSettingsForm } from '../components/PartnerSettingsForm';
import { LogoUpload } from '../components/LogoUpload';
import { IntegrationsCard } from '../components/IntegrationsCard';

export function SettingsPage() {
  const { appName } = useAppStore();
  const { data: rawSettings, isLoading } = usePublicSettings();
  const updateSettings = useUpdateSettings();

  const methods = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      app_name: appName,
      partner_commission_type: 'percentage',
      partner_commission_value: 10,
    },
  });

  // Keep form in sync with global state if it changes externally
  useEffect(() => {
    if (appName) {
      methods.setValue('app_name', appName);
    }
    if (rawSettings) {
      if (rawSettings.partner_commission_type) {
        methods.setValue('partner_commission_type', rawSettings.partner_commission_type as any);
      }
      if (rawSettings.partner_commission_value !== undefined) {
        methods.setValue('partner_commission_value', Number(rawSettings.partner_commission_value));
      }
    }
  }, [appName, rawSettings, methods]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings.mutate({
      app_name: data.app_name,
      partner_commission_type: data.partner_commission_type,
      partner_commission_value: String(data.partner_commission_value),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        
        {/* PageHeader Skeleton */}
        <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-4 relative z-10">
          <Skeleton className="h-10 w-64 rounded-xl bg-slate-200/50 dark:bg-white/5" />
          <Skeleton className="h-5 w-96 rounded-lg bg-slate-200/50 dark:bg-white/5" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 relative z-10 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form Skeleton */}
            <div className="lg:col-span-3 bg-white/70 dark:bg-[#111115]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center gap-4 mb-8">
                <Skeleton className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                  <Skeleton className="h-4 w-48 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                  <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                  <Skeleton className="h-12 w-40 rounded-xl bg-slate-200/50 dark:bg-white/5" />
                </div>
              </div>
            </div>

            {/* Logo Skeleton */}
            <div className="lg:col-span-2 bg-slate-900 dark:bg-[#111115] border border-slate-800 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <Skeleton className="w-12 h-12 rounded-2xl bg-white/5" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 rounded-lg bg-white/5" />
                  <Skeleton className="h-4 w-24 rounded-lg bg-white/5" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-6">
                <Skeleton className="w-40 h-40 rounded-2xl bg-white/5" />
                <div className="mt-6 space-y-2 flex flex-col items-center">
                  <Skeleton className="h-3 w-40 rounded-lg bg-white/5" />
                  <Skeleton className="h-3 w-32 rounded-lg bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-40 -left-40 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <PageHeader
        icon={Settings}
        title="Platform Settings"
        subtitle="Manage global white-labeling, brand identity, and application preferences"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 relative z-10">
        <FormProvider {...methods}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <BrandIdentityForm isPending={updateSettings.isPending} onSubmit={onSubmit} />
            <PartnerSettingsForm isPending={updateSettings.isPending} onSubmit={onSubmit} />
            <LogoUpload />
            <IntegrationsCard />
          </div>
        </FormProvider>
      </div>
    </div>
  );
}
