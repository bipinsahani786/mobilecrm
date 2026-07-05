import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Lead {
  id: number;
  partner_id: number;
  business_name: string;
  contact_person: string;
  phone: string | null;
  email: string | null;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  notes: string | null;
  created_at: string;
  contacts_count?: number;
  partner?: any;
  last_contact?: {
    id: number;
    outcome: 'called' | 'emailed' | 'whatsapp' | 'visited' | 'no_answer';
    contacted_at: string;
    next_contact_at: string | null;
    notes: string | null;
  } | null;
}

export type LeadFormValues = Omit<Lead, 'id' | 'created_at' | 'partner'>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LeadQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  partner_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  follow_up_date?: string;
  outcome?: string;
  all?: boolean;
  from_date?: string;
  to_date?: string;
}

export const useLeads = (params?: LeadQueryFilters) => {
  return useQuery<PaginatedResponse<Lead>>({
    queryKey: ['superadmin', 'leads', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/leads', { params });
      return data;
    },
  });
};

export interface LeadStats {
  total: number;
  newCount: number;
  contacted: number;
  converted: number;
  lost: number;
  rate: number;
}

export const useLeadStats = () => {
  return useQuery<LeadStats>({
    queryKey: ['superadmin', 'leads', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/leads/stats');
      return data.data;
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LeadFormValues) => {
      const response = await api.post('/superadmin/leads', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads'] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LeadFormValues> }) => {
      const response = await api.patch(`/superadmin/leads/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads'] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/superadmin/leads/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'leads'] });
    },
  });
};
