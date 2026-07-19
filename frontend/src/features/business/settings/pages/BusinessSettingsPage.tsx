import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Settings, UploadCloud, FileText, LayoutGrid, MapPin, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Image } from '@/components/ui/image';
import { uploadToR2 } from '@/lib/r2';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useUpdateBusiness } from '../../profile/api/useBusinessMutations';

import { DynamicForm } from '@/components/ui/dynamic-form';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';
import { BusinessLocationsSection } from '../../profile/components/BusinessLocationsSection';
import { InvoicePatternBuilder } from '../components/InvoicePatternBuilder';
import { InvoicePrintSettings } from '../../profile/components/InvoicePrintSettings';
import { WhatsAppSettings } from '../components/WhatsAppSettings';

const businessSettingsSchema = z.object({
  settings: z.object({
    commission_calculation_base: z.enum(['sales', 'profit']).default('sales'),
    sale_invoice_prefix: z.string().default('INV-{YYYY}-{MM}-{SEQ:4}'),
    purchase_invoice_prefix: z.string().default('PUR-{YYYY}-{MM}-{SEQ:4}'),
    whitelabel_name: z.string().nullable().optional(),
    whitelabel_logo: z.string().nullable().optional(),
    whitelabel_favicon: z.string().nullable().optional(),
    whatsapp_message_format: z.string().nullable().optional(),
  }).default({
    commission_calculation_base: 'sales',
    sale_invoice_prefix: 'INV-{YYYY}-{MM}-{SEQ:4}',
    purchase_invoice_prefix: 'PUR-{YYYY}-{MM}-{SEQ:4}'
  })
});

type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;

export default function BusinessSettingsPage() {
  const { activeBusiness, updateBusiness, isLoading } = useTenantStore();
  const navigate = useNavigate();

  const updateBusinessMutation = useUpdateBusiness();

  const [isUploadingWlLogo, setIsUploadingWlLogo] = useState(false);
  const [isUploadingWlFavicon, setIsUploadingWlFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'config', label: 'Configurations', icon: LayoutGrid },
    { id: 'locations', label: 'Business Locations', icon: MapPin },
  ];
  const [wlLogoUrl, setWlLogoUrl] = useState<string | null>(activeBusiness?.settings?.whitelabel_logo || null);
  const [wlFaviconUrl, setWlFaviconUrl] = useState<string | null>(activeBusiness?.settings?.whitelabel_favicon || null);
  const [wlLogoPreview, setWlLogoPreview] = useState<string | null>(activeBusiness?.settings?.whitelabel_logo || null);
  const [wlFaviconPreview, setWlFaviconPreview] = useState<string | null>(activeBusiness?.settings?.whitelabel_favicon || null);

  const [isUploadingInvoiceHeader, setIsUploadingInvoiceHeader] = useState(false);
  const [isUploadingInvoiceFooter, setIsUploadingInvoiceFooter] = useState(false);
  const [invoiceHeaderUrl, setInvoiceHeaderUrl] = useState<string | null>(activeBusiness?.settings?.invoice_header_image || null);
  const [invoiceFooterUrl, setInvoiceFooterUrl] = useState<string | null>(activeBusiness?.settings?.invoice_footer_image || null);
  const [invoiceHeaderPreview, setInvoiceHeaderPreview] = useState<string | null>(activeBusiness?.settings?.invoice_header_image || null);
  const [invoiceFooterPreview, setInvoiceFooterPreview] = useState<string | null>(activeBusiness?.settings?.invoice_footer_image || null);

  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema) as any,
    defaultValues: activeBusiness ? {
      settings: {
        ...activeBusiness.settings,
        whatsapp_message_format: activeBusiness.settings?.whatsapp_message_format || 'Hello {customer_name}! Here is your invoice {invoice_number} for Rs.{amount}.\n\nYou can view and download your original PDF receipt here:\n{link}'
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
        settings: {
          ...activeBusiness.settings,
          whatsapp_message_format: activeBusiness.settings?.whatsapp_message_format || 'Hello {customer_name}! Here is your invoice {invoice_number} for Rs.{amount}.\n\nYou can view and download your original PDF receipt here:\n{link}'
        }
      });
      setWlLogoUrl(activeBusiness.settings?.whitelabel_logo || null);
      setWlFaviconUrl(activeBusiness.settings?.whitelabel_favicon || null);
      setWlLogoPreview(activeBusiness.settings?.whitelabel_logo || null);
      setWlFaviconPreview(activeBusiness.settings?.whitelabel_favicon || null);
      
      setInvoiceHeaderUrl(activeBusiness.settings?.invoice_header_image || null);
      setInvoiceFooterUrl(activeBusiness.settings?.invoice_footer_image || null);
      setInvoiceHeaderPreview(activeBusiness.settings?.invoice_header_image || null);
      setInvoiceFooterPreview(activeBusiness.settings?.invoice_footer_image || null);
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

  const handleInvoiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (type === 'header') setInvoiceHeaderPreview(objectUrl);
    else setInvoiceFooterPreview(objectUrl);

    try {
      if (type === 'header') setIsUploadingInvoiceHeader(true);
      else setIsUploadingInvoiceFooter(true);

      const { public_url } = await uploadToR2(file, `uploads/invoice-${type}s`);
      
      if (type === 'header') {
        setInvoiceHeaderUrl(public_url);
        form.setValue('settings.invoice_header_image' as any, public_url);
      } else {
        setInvoiceFooterUrl(public_url);
        form.setValue('settings.invoice_footer_image' as any, public_url);
      }
      
      toast.success(`Invoice ${type} uploaded successfully!`);
    } catch {
      toast.error(`Failed to upload invoice ${type}`);
    } finally {
      if (type === 'header') setIsUploadingInvoiceHeader(false);
      else setIsUploadingInvoiceFooter(false);
    }
  };

  const handleRemoveInvoiceImage = (type: 'header' | 'footer') => {
    if (type === 'header') {
      setInvoiceHeaderUrl(null);
      setInvoiceHeaderPreview(null);
      form.setValue('settings.invoice_header_image' as any, null);
    } else {
      setInvoiceFooterUrl(null);
      setInvoiceFooterPreview(null);
      form.setValue('settings.invoice_footer_image' as any, null);
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
          invoice_header_image: invoiceHeaderUrl,
          invoice_footer_image: invoiceFooterUrl,
        }
      };

      const res = await updateBusinessMutation.mutateAsync({ id: activeBusiness.id, data: payload as any });
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
      className: activeTab === 'general' ? 'block' : 'hidden',
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
      className: activeTab === 'invoice' ? 'block' : 'hidden',
      fields: [
        {
          name: 'settings.sale_invoice_prefix',
          label: 'Sales Invoice Pattern',
          type: 'custom',
          colSpan: 2,
          render: (form) => (
            <InvoicePatternBuilder 
              label="Sales Invoice Pattern" 
              value={form.watch('settings.sale_invoice_prefix')} 
              onChange={(val) => form.setValue('settings.sale_invoice_prefix', val, { shouldDirty: true })} 
            />
          )
        },
        {
          name: 'settings.purchase_invoice_prefix',
          label: 'Purchase Invoice Pattern',
          type: 'custom',
          colSpan: 2,
          render: (form) => (
            <InvoicePatternBuilder 
              label="Purchase Invoice Pattern" 
              value={form.watch('settings.purchase_invoice_prefix')} 
              onChange={(val) => form.setValue('settings.purchase_invoice_prefix', val, { shouldDirty: true })} 
            />
          )
        },
        {
          name: 'invoice_settings',
          label: 'Invoice Print Settings',
          type: 'custom',
          colSpan: 2,
          render: () => (
            <InvoicePrintSettings
              headerUrl={invoiceHeaderPreview}
              footerUrl={invoiceFooterPreview}
              isUploadingHeader={isUploadingInvoiceHeader}
              isUploadingFooter={isUploadingInvoiceFooter}
              onUpload={handleInvoiceImageUpload}
              onRemove={handleRemoveInvoiceImage}
            />
          )
        }
      ]
    },
    {
      title: 'WhatsApp Configuration',
      className: activeTab === 'whatsapp' ? 'block' : 'hidden',
      fields: [
        {
          name: 'whatsapp_settings',
          label: '',
          type: 'custom',
          colSpan: 2,
          render: (form) => (
            <WhatsAppSettings
              settings={form.watch('settings')}
              onSave={async (updatedSettings) => {
                form.setValue('settings', updatedSettings, { shouldDirty: true });
                await form.handleSubmit(onSubmit)();
              }}
              isLoading={isSubmitting}
            />
          )
        }
      ]
    },
    {
      title: 'System Configurations',
      className: activeTab === 'config' ? 'block' : 'hidden',
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

      <div className="w-full px-3 sm:px-6 py-3 sm:py-4 md:py-6 overflow-x-hidden min-w-0">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 min-w-0">
          
          <div className="lg:col-span-12 min-w-0 flex flex-col gap-4">
            
            {/* Mobile Dropdown Navigation */}
            <div className="block md:hidden mb-2">
              <CustomSelect 
                value={activeTab} 
                onChange={setActiveTab}
                options={tabs.map((tab) => ({
                  value: tab.id,
                  label: tab.label
                }))}
              />
            </div>

            {/* Desktop Tabs Navigation */}
            <div className="hidden md:flex overflow-x-auto gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl w-max scrollbar-hide mb-2 border border-slate-300/30 dark:border-white/5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-all duration-300 rounded-xl whitespace-nowrap",
                      isActive
                        ? "text-primary-700 bg-white shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-700 dark:text-primary-300 dark:ring-white/10"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-300/30 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary-600 dark:text-primary-400" : "")} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] min-w-0 flex flex-col gap-8 overflow-hidden">
              
              {/* Subtle gradient blobs for premium feel */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 w-full space-y-6">
                <div className={activeTab !== 'locations' ? 'block' : 'hidden'}>
                  <DynamicForm 
                    id="settings-form"
                    form={form}
                    onSubmit={onSubmit}
                    sections={settingsFormConfig}
                  />
                </div>

                <div className={activeTab === 'locations' ? 'block' : 'hidden'}>
                  <BusinessLocationsSection />
                </div>

                <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    form="settings-form" 
                    disabled={isSubmitting || activeTab === 'locations'} 
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 px-10 h-12 rounded-xl text-sm font-bold tracking-wide w-full md:w-auto transition-all hover:scale-[1.02]"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
