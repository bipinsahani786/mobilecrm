import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { uploadToR2 } from '@/lib/r2';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { businessSchema, type BusinessFormValues } from '../schemas/businessSchema';
import { useCreateBusiness, useUpdateBusiness } from '../api/useBusinessMutations';

import { DynamicForm } from '@/components/ui/dynamic-form';
import { getBusinessProfileFormConfig } from '../constants/businessForm';
import { ProfilePreviewPanel } from '../components/ProfilePreviewPanel';
import { BrandingAssetsSection } from '../components/BrandingAssetsSection';

export default function BusinessProfilePage() {
  const { activeBusiness, addBusiness, updateBusiness, isLoading } = useTenantStore();
  const navigate = useNavigate();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSig, setIsUploadingSig] = useState(false);
  
  const createBusinessMutation = useCreateBusiness();
  const updateBusinessMutation = useUpdateBusiness();

  const [logoUrl, setLogoUrl] = useState<string | null>(activeBusiness?.logo_path || null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(activeBusiness?.signature_path || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(activeBusiness?.logo_path || null);
  const [sigPreview, setSigPreview] = useState<string | null>(activeBusiness?.signature_path || null);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema) as any,
    defaultValues: activeBusiness ? {
      ...activeBusiness,
      card_preferences: {
        show_address: activeBusiness.card_preferences?.show_address ?? true,
        show_email: activeBusiness.card_preferences?.show_email ?? true,
        show_phone_2: activeBusiness.card_preferences?.show_phone_2 ?? true,
        show_gst: activeBusiness.card_preferences?.show_gst ?? true,
        theme: activeBusiness.card_preferences?.theme ?? 'primary',
      },
      settings: {
        commission_calculation_base: activeBusiness?.settings?.commission_calculation_base ?? 'sales',
        sale_invoice_prefix: activeBusiness?.settings?.sale_invoice_prefix ?? 'INV-',
        purchase_invoice_prefix: activeBusiness?.settings?.purchase_invoice_prefix ?? 'PUR-',
        whitelabel_name: activeBusiness?.settings?.whitelabel_name ?? null,
        whitelabel_logo: activeBusiness?.settings?.whitelabel_logo ?? null,
        whitelabel_favicon: activeBusiness?.settings?.whitelabel_favicon ?? null,
        whatsapp_message_format: activeBusiness?.settings?.whatsapp_message_format ?? 'Hello {customer_name}! Here is your invoice {invoice_number} for Rs.{amount}.\n\nYou can view and download your original PDF receipt here:\n{link}'
      }
    } : {
      name: '',
      card_preferences: {
        show_address: true,
        show_email: true,
        show_phone_2: true,
        show_gst: true,
        theme: 'primary',
      },
      settings: {
        commission_calculation_base: 'sales',
        sale_invoice_prefix: 'INV-',
        purchase_invoice_prefix: 'PUR-',
      }
    } as any
  });

  const { watch, control, reset, formState: { isSubmitting } } = form;

  const formData = watch();

  // Re-sync form when active business changes (e.g., loaded from API)
  useEffect(() => {
    if (activeBusiness) {
      reset({
        ...activeBusiness,
        card_preferences: {
          show_address: activeBusiness.card_preferences?.show_address ?? true,
          show_email: activeBusiness.card_preferences?.show_email ?? true,
          show_phone_2: activeBusiness.card_preferences?.show_phone_2 ?? true,
          show_gst: activeBusiness.card_preferences?.show_gst ?? true,
          theme: activeBusiness.card_preferences?.theme ?? 'primary',
        },
        settings: {
          commission_calculation_base: activeBusiness.settings?.commission_calculation_base ?? 'sales',
          sale_invoice_prefix: activeBusiness.settings?.sale_invoice_prefix ?? 'INV-',
          purchase_invoice_prefix: activeBusiness.settings?.purchase_invoice_prefix ?? 'PUR-',
          whitelabel_name: activeBusiness.settings?.whitelabel_name ?? null,
          whitelabel_logo: activeBusiness.settings?.whitelabel_logo ?? null,
          whitelabel_favicon: activeBusiness.settings?.whitelabel_favicon ?? null,
        }
      });
      setLogoUrl(activeBusiness.logo_path);
      setSignatureUrl(activeBusiness.signature_path);
      setLogoPreview(activeBusiness.logo_path);
      setSigPreview(activeBusiness.signature_path);
    } else {
      // Adding new branch - Reset form to blank
      reset({
        name: '',
        email: '',
        phone: '',
        phone_2: '',
        gst_number: '',
        address: '',
        pincode: '',
        state: '',
        description: '',
        business_type: '',
        business_category: '',
        books_opening_date: '',
        card_preferences: {
          show_address: true,
          show_email: true,
          show_phone_2: true,
          show_gst: true,
          theme: 'primary',
        },
        settings: {
          commission_calculation_base: 'sales',
          sale_invoice_prefix: 'INV-',
          purchase_invoice_prefix: 'PUR-',
        }
      });
      setLogoUrl(null);
      setSignatureUrl(null);
      setLogoPreview(null);
      setSigPreview(null);
    }
  }, [activeBusiness, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (type === 'logo') setLogoPreview(objectUrl);
    else setSigPreview(objectUrl);

    try {
      if (type === 'logo') setIsUploadingLogo(true);
      else setIsUploadingSig(true);

      const folderName = type === 'logo' ? 'asset-1' : 'asset-2';
      const { public_url } = await uploadToR2(file, `uploads/${folderName}`);
      
      if (type === 'logo') setLogoUrl(public_url);
      else setSignatureUrl(public_url);
      
      toast.success(`${type} uploaded successfully!`);
    } catch {
      toast.error(`Failed to upload ${type}`);
    } finally {
      if (type === 'logo') setIsUploadingLogo(false);
      else setIsUploadingSig(false);
    }
  };

  const onSubmit = async (data: BusinessFormValues) => {
    try {
      const payload = {
        ...data,
        logo_path: logoUrl,
        signature_path: signatureUrl,
      };

      if (activeBusiness) {
        // Update existing
        const res = await updateBusinessMutation.mutateAsync({ id: activeBusiness.id, data: payload });
        updateBusiness(res);
        toast.success('Business profile updated!');
      } else {
        // Create new
        const res = await createBusinessMutation.mutateAsync(payload);
        addBusiness(res);
        toast.success('Business created successfully!');
        navigate('/dashboard'); // Go to dashboard after initial setup
      }
    } catch (error) {
      toast.error('Failed to save profile. Please check the fields.');
      console.error(error);
    }
  };

  const liveCardData = {
    ...formData,
    logo_path: logoPreview,
    signature_path: sigPreview,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
        <PageHeader 
          icon={Building2}
          title="Business Management"
          subtitle="Register and manage profile."
        />
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-4 md:py-6">
          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/50 p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 dark:border-white/5 space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-5 w-1/3" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Skeleton className="h-3 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-3 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-5 space-y-6">
              <Skeleton className="h-[240px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      
      {/* Top Header Bar */}
      <PageHeader 
        icon={Building2}
        title="Business Management"
        subtitle="Register and manage profile."
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/dashboard') },
          { label: activeBusiness ? 'Profile' : 'Setup', active: true }
        ]}
      />

      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-4 md:py-6 overflow-x-hidden min-w-0">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 min-w-0">
          
          {/* LEFT: FORM (Scrollable) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/50 p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none min-w-0 flex flex-col gap-6 max-w-4xl">
            <DynamicForm 
              id="business-form"
              form={form}
              onSubmit={onSubmit}
              sections={getBusinessProfileFormConfig(() => (
                <BrandingAssetsSection 
                  logoPreview={logoPreview} 
                  sigPreview={sigPreview} 
                  isUploadingLogo={isUploadingLogo} 
                  isUploadingSig={isUploadingSig} 
                  onFileUpload={handleFileUpload} 
                />
              ))}
            />

            <div className="pt-5 border-t border-slate-200 dark:border-white/5 flex justify-end">
              <Button type="submit" form="business-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white shadow-md px-8 h-10 rounded-lg text-sm font-semibold tracking-wide w-full md:w-auto">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {activeBusiness ? 'Save Changes' : 'Create Business'}
              </Button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW (Sticky) */}
          <div className="lg:col-span-5 relative min-w-0">
            <ProfilePreviewPanel control={control} liveCardData={liveCardData} />
          </div>
        </div>
      </div>
    </div>
  );
}
