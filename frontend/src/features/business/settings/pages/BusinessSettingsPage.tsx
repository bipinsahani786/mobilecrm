import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Settings, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Image } from '@/components/ui/image';
import { uploadToR2 } from '@/lib/r2';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useUpdateBusiness } from '../../profile/api/useBusinessMutations';

import { DynamicForm } from '@/components/ui/dynamic-form';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';
import { BusinessLocationsSection } from '../../profile/components/BusinessLocationsSection';

const businessSettingsSchema = z.object({
  settings: z.object({
    commission_calculation_base: z.enum(['sales', 'profit']).default('sales'),
    sale_invoice_prefix: z.string().default('INV-'),
    purchase_invoice_prefix: z.string().default('PUR-'),
    whitelabel_name: z.string().nullable().optional(),
    whitelabel_logo: z.string().nullable().optional(),
    whitelabel_favicon: z.string().nullable().optional(),
  }).default({
    commission_calculation_base: 'sales',
    sale_invoice_prefix: 'INV-',
    purchase_invoice_prefix: 'PUR-'
  })
});

type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;

export default function BusinessSettingsPage() {
  const { activeBusiness, updateBusiness, isLoading } = useTenantStore();
  const navigate = useNavigate();

  const updateBusinessMutation = useUpdateBusiness();

  const [isUploadingWlLogo, setIsUploadingWlLogo] = useState(false);
  const [isUploadingWlFavicon, setIsUploadingWlFavicon] = useState(false);
  const [wlLogoUrl, setWlLogoUrl] = useState<string | null>(activeBusiness?.settings?.whitelabel_logo || null);
  const [wlFaviconUrl, setWlFaviconUrl] = useState<string | null>(activeBusiness?.settings?.whitelabel_favicon || null);
  const [wlLogoPreview, setWlLogoPreview] = useState<string | null>(activeBusiness?.settings?.whitelabel_logo || null);
  const [wlFaviconPreview, setWlFaviconPreview] = useState<string | null>(activeBusiness?.settings?.whitelabel_favicon || null);

  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema) as any,
    defaultValues: activeBusiness ? {
      settings: activeBusiness.settings || {
        commission_calculation_base: 'sales',
        sale_invoice_prefix: 'INV-',
        purchase_invoice_prefix: 'PUR-',
      }
    } : undefined
  });

  const { watch, control, reset, formState: { isSubmitting, errors } } = form;
  const formData = watch();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
      toast.error('Validation failed. Please check console for details.');
    }
  }, [errors]);

  useEffect(() => {
    if (activeBusiness) {
      reset({
        settings: activeBusiness.settings || {
          commission_calculation_base: 'sales',
          sale_invoice_prefix: 'INV-',
          purchase_invoice_prefix: 'PUR-',
        }
      });
      setWlLogoUrl(activeBusiness.settings?.whitelabel_logo || null);
      setWlFaviconUrl(activeBusiness.settings?.whitelabel_favicon || null);
      setWlLogoPreview(activeBusiness.settings?.whitelabel_logo || null);
      setWlFaviconPreview(activeBusiness.settings?.whitelabel_favicon || null);
    }
  }, [activeBusiness, reset]);

  const handleWlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (type === 'logo') setWlLogoPreview(objectUrl);
    else setWlFaviconPreview(objectUrl);

    try {
      if (type === 'logo') setIsUploadingWlLogo(true);
      else setIsUploadingWlFavicon(true);

      const folderName = type === 'logo' ? 'wl-logo' : 'wl-favicon';
      const { public_url } = await uploadToR2(file, `uploads/${folderName}`);
      
      if (type === 'logo') setWlLogoUrl(public_url);
      else setWlFaviconUrl(public_url);
      
      toast.success(`${type} uploaded successfully!`);
    } catch {
      toast.error(`Failed to upload ${type}`);
    } finally {
      if (type === 'logo') setIsUploadingWlLogo(false);
      else setIsUploadingWlFavicon(false);
    }
  };

  const onSubmit = async (data: BusinessSettingsFormValues) => {
    try {
      if (!activeBusiness) return;
      const payload = {
        ...data,
        settings: {
          ...data.settings,
          whitelabel_logo: wlLogoUrl,
          whitelabel_favicon: wlFaviconUrl,
        }
      };

      const res = await updateBusinessMutation.mutateAsync({ id: activeBusiness.id, data: payload });
      updateBusiness(res);
      toast.success('Business settings updated!');
    } catch (error) {
      toast.error('Failed to save settings. Please check the fields.');
      console.error(error);
    }
  };


  const settingsFormConfig: FormSectionConfig[] = [
    {
      title: 'Panel Whitelabeling',
      fields: [
        {
          name: 'settings.whitelabel_name',
          label: 'Custom Panel Name',
          type: 'text',
          placeholder: 'E.g. My Shop Name',
          tooltip: 'Overrides the default CRM name in the top left corner.',
        },
        {
          name: 'wl_assets',
          label: 'Whitelabel Assets',
          type: 'custom',
          colSpan: 2,
          render: () => (
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
                {wlLogoPreview ? (
                  <div className="relative group w-full h-12 flex items-center justify-center">
                    <Image src={wlLogoPreview} alt="Logo" className="max-h-12 w-auto object-contain rounded" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded">
                      <UploadCloud className="w-5 h-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWlFileUpload(e, 'logo')} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-2">
                    {isUploadingWlLogo ? <Loader2 className="w-6 h-6 animate-spin text-primary-500 mb-1" /> : <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload Panel Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWlFileUpload(e, 'logo')} disabled={isUploadingWlLogo} />
                  </label>
                )}
              </div>
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
                {wlFaviconPreview ? (
                  <div className="relative group w-full h-12 flex items-center justify-center">
                    <Image src={wlFaviconPreview} alt="Favicon" className="max-h-12 w-auto object-contain rounded" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded">
                      <UploadCloud className="w-5 h-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWlFileUpload(e, 'favicon')} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-2">
                    {isUploadingWlFavicon ? <Loader2 className="w-6 h-6 animate-spin text-primary-500 mb-1" /> : <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload Favicon</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWlFileUpload(e, 'favicon')} disabled={isUploadingWlFavicon} />
                  </label>
                )}
              </div>
            </div>
          )
        }
      ]
    },
    {
      title: 'Invoice Formatting',
      fields: [
        {
          name: 'settings.sale_invoice_prefix',
          label: 'Sales Invoice Prefix',
          type: 'text',
          tooltip: 'The prefix for all generated sales invoices. E.g., INV- will result in INV-0001, INV-0002.',
          placeholder: 'INV-',
        },
        {
          name: 'settings.purchase_invoice_prefix',
          label: 'Purchase Invoice Prefix',
          type: 'text',
          tooltip: 'The prefix for purchase records internally generated by the system.',
          placeholder: 'PUR-',
        }
      ]
    },
    {
      title: 'Business Configurations',
      fields: [
        {
          name: 'settings.commission_calculation_base',
          label: 'Commission Calculation Base',
          type: 'select',
          options: [
            { label: 'Based on Total Sales (Revenue)', value: 'sales' },
            { label: 'Based on Total Profit', value: 'profit' },
          ],
          tooltip: 'Select how staff commission should be calculated.',
        },
      ]
    },
  ];

  if (isLoading) return <div className="p-8"><Skeleton className="w-full h-96" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Settings}
        title="Business Settings"
        subtitle="Configure branding, formats, and operational rules."
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/dashboard') },
          { label: 'Settings', active: true }
        ]}
      />

      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-4 md:py-6 overflow-x-hidden min-w-0">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 min-w-0">
          
          <div className="lg:col-span-12 bg-white dark:bg-slate-900/50 p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none min-w-0 flex flex-col gap-6 max-w-4xl">
            <DynamicForm 
              id="settings-form"
              form={form}
              onSubmit={onSubmit}
              sections={settingsFormConfig}
            />

            <BusinessLocationsSection />

            <div className="pt-5 border-t border-slate-200 dark:border-white/5 flex justify-end">
              <Button type="submit" form="settings-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white shadow-md px-8 h-10 rounded-lg text-sm font-semibold tracking-wide w-full md:w-auto">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
