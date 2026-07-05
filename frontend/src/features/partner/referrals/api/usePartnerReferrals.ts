import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Referral {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  plan?: { id: number; name: string; price: number };
  owner?: { id: number; name: string };
  created_at: string;
}

export interface ReferralDetail {
  business: Referral;
  commissions: any[];
  total_commission: number;
}

export interface ReferralFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const usePartnerReferrals = (params?: ReferralFilters) => {
  return useQuery({
    queryKey: ['partner', 'referrals', params],
    queryFn: async () => {
      const { data } = await api.get('/partner/referrals', { params });
      return data;
    },
  });
};

export const usePartnerReferralDetail = (id: number | null) => {
  return useQuery<ReferralDetail>({
    queryKey: ['partner', 'referrals', id],
    queryFn: async () => {
      const { data } = await api.get(`/partner/referrals/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const usePartnerReferralLink = () => {
  return useQuery({
    queryKey: ['partner', 'referral-link'],
    queryFn: async () => {
      const { data } = await api.get('/partner/referral-link');
      return data.data;
    },
  });
};
