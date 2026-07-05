import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { toast } from 'sonner';
import { useCreatePartner, useUpdatePartner, type Partner, type PartnerFormValues } from '../api/usePartners';
import { partnerSchema, type PartnerFormValues as PartnerSchemaValues } from '../schemas/partnerSchema';
import { getPartnerFormConfig } from '../constants/partnerForm';


interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
}

export function PartnerFormModal({ isOpen, onClose, partner }: PartnerFormModalProps) {
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();

  const form = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company_name: '',
      commission_type: 'percentage',
      commission_value: 0,
      is_recurring_commission: false,
      custom_domain: '',
      status: true,
      password: '',
    }
  });
  const { reset, watch, formState: { isSubmitting } } = form;

  const commissionType = watch('commission_type');

  useEffect(() => {
    if (isOpen) {
      if (partner) {
        reset({
          name: partner.name,
          email: partner.email,
          phone: partner.phone || '',
          company_name: partner.company_name || '',
          commission_type: partner.commission_type,
          commission_value: partner.commission_value,
          is_recurring_commission: partner.is_recurring_commission,
          custom_domain: partner.custom_domain || '',
          status: partner.status,
          password: '', // Don't prefill password
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          company_name: '',
          commission_type: 'percentage',
          commission_value: 0,
          is_recurring_commission: false,
          custom_domain: '',
          status: true,
          password: '',
        });
      }
    }
  }, [isOpen, partner, reset]);

  const onSubmit = async (data: PartnerSchemaValues) => {
    try {
      const payload: PartnerFormValues = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company_name: data.company_name || null,
        commission_type: data.commission_type,
        commission_value: Number(data.commission_value),
        is_recurring_commission: !!data.is_recurring_commission,
        custom_domain: data.custom_domain || null,
        payout_details: partner ? partner.payout_details : null,
        status: !!data.status,
        password: data.password || undefined,
      };

      if (partner) {
        await updatePartner.mutateAsync({ id: partner.id, data: payload });
        toast.success('Partner updated successfully');
      } else {
        await createPartner.mutateAsync(payload);
        toast.success('Partner created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save partner');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={partner ? 'Edit Partner' : 'Create New Partner'}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="partner-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white px-6">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {partner ? 'Save Changes' : 'Create Partner'}
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="partner-form"
        form={form}
        onSubmit={onSubmit}
        sections={getPartnerFormConfig(commissionType)}
      />
    </Modal>
  );
}
