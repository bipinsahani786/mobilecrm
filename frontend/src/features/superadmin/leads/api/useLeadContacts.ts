import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface LeadContact {
  id: number;
  lead_id: number;
  contacted_by: string;
  contacted_at: string;
  outcome: 'called' | 'emailed' | 'whatsapp' | 'visited' | 'no_answer';
  notes: string | null;
  next_contact_at: string | null;
  created_at: string;
}

export const useLeadContacts = (leadId: number | null) => {
  return useQuery<LeadContact[]>({
    queryKey: ['superadmin', 'leads', leadId, 'contacts'],
    queryFn: async () => {
      const { data } = await api.get(`/superadmin/leads/${leadId}/contacts`);
      return data.data;
    },
    enabled: !!leadId,
  });
};

export const useLogContact = (leadId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<LeadContact, 'id' | 'lead_id' | 'created_at'>) => {
      const { data } = await api.post(`/superadmin/leads/${leadId}/contacts`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads', leadId, 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads'] });
    },
  });
};

export const useDeleteContact = (leadId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: number) => {
      await api.delete(`/superadmin/leads/${leadId}/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads', leadId, 'contacts'] });
    },
  });
};

export const useImportLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/superadmin/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads'] });
    },
  });
};
