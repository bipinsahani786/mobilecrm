import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { toast } from 'sonner';
import { usePartners } from '../../partners/api/usePartners';
import { useCreateLead, useUpdateLead, type Lead, type LeadFormValues } from '../api/useLeads';
import { leadSchema, type LeadFormValues as LeadSchemaValues } from '../schemas/leadSchema';
import { getLeadFormConfig } from '../constants/leadForm';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export function LeadFormModal({ isOpen, onClose, lead }: LeadFormModalProps) {
  const { data: partnersData } = usePartners({ all: true });
  const partners = partnersData?.data;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const form = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      partner_id: 0,
      business_name: '',
      contact_person: '',
      phone: '',
      email: '',
      status: 'new',
      notes: '',
    },
  });
  const { reset, formState: { isSubmitting } } = form;

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        reset({
          partner_id: lead.partner_id,
          business_name: lead.business_name,
          contact_person: lead.contact_person,
          phone: lead.phone || '',
          email: lead.email || '',
          status: lead.status,
          notes: lead.notes || '',
        });
      } else {
        reset({
          partner_id: 0,
          business_name: '',
          contact_person: '',
          phone: '',
          email: '',
          status: 'new',
          notes: '',
        });
      }
    }
  }, [isOpen, lead, reset]);

  const onSubmit: SubmitHandler<LeadSchemaValues> = async (data) => {
    try {
      const payload: LeadFormValues = {
        partner_id: Number(data.partner_id),
        business_name: data.business_name,
        contact_person: data.contact_person,
        status: data.status,
        phone: data.phone || null,
        email: data.email || null,
        notes: data.notes || null,
      };

      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, data: payload });
        toast.success('Lead updated successfully');
      } else {
        await createLead.mutateAsync(payload);
        toast.success('Lead added successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save lead');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'Add New Lead'}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button size="sm" type="submit" form="lead-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white px-6">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {lead ? 'Save Changes' : 'Add Lead'}
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="lead-form"
        form={form}
        onSubmit={onSubmit}
        sections={getLeadFormConfig(partners)}
      />
    </Modal>
  );
}
