import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  referral_code: string;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  is_recurring_commission: boolean;
  custom_domain: string | null;
  payout_details: any | null;
  status: boolean;
  businesses_count?: number;
  created_at: string;
}

export type PartnerFormValues = Omit<Partner, 'id' | 'created_at' | 'businesses_count' | 'referral_code'> & { password?: string };

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PartnerQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  all?: boolean;
  from_date?: string;
  to_date?: string;
}

export const usePartners = (params?: PartnerQueryFilters) => {
  return useQuery<PaginatedResponse<Partner>>({
    queryKey: ['superadmin', 'partners', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/partners', { params });
      return data;
    },
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      const response = await api.post('/superadmin/partners', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'partners'] });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PartnerFormValues> }) => {
      const response = await api.patch(`/superadmin/partners/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'partners'] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/superadmin/partners/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'partners'] });
    },
  });
};

export interface PartnerAnalytics {
  partner: Partner;
  metrics: {
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
    total_businesses: number;
    total_referred_revenue: number;
    total_commission_earned: number;
    paid_commission: number;
    pending_commission: number;
    cancelled_commission: number;
  };
  recent_leads: any[];
  recent_commissions: any[];
}

export const usePartnerAnalytics = (id: number | null) => {
  return useQuery<PartnerAnalytics>({
    queryKey: ['superadmin', 'partners', id, 'analytics'],
    queryFn: async () => {
      const { data } = await api.get(`/superadmin/partners/${id}/analytics`);
      return data.data;
    },
    enabled: id !== null && id !== undefined && !isNaN(id),
  });
};
