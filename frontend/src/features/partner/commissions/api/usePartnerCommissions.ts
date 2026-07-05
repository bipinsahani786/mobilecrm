import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PartnerCommission {
  id: number;
  partner_id: number;
  business_id: number;
  plan_id: number | null;
  amount_paid_by_tenant: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at: string | null;
  created_at: string;
  business?: { id: number; name: string };
  plan?: { id: number; name: string };
}

export interface CommissionFilters {
  page?: number;
  per_page?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const usePartnerCommissions = (params?: CommissionFilters) => {
  return useQuery({
    queryKey: ['partner', 'commissions', params],
    queryFn: async () => {
      const { data } = await api.get('/partner/commissions', { params });
      return data;
    },
  });
};

export const usePartnerCommissionStats = () => {
  return useQuery({
    queryKey: ['partner', 'commissions', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/partner/commissions/stats');
      return data.data;
    },
  });
};
