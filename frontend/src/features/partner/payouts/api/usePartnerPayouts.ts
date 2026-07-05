import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PayoutRequest {
  id: number;
  partner_id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  notes: string | null;
  admin_notes: string | null;
  approved_at: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  partner?: any;
}

export interface PayoutFilters {
  page?: number;
  per_page?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export const usePartnerPayouts = (params?: PayoutFilters) => {
  return useQuery({
    queryKey: ['partner', 'payouts', params],
    queryFn: async () => {
      const { data } = await api.get('/partner/payouts', { params });
      return data;
    },
  });
};

export const useCreatePayoutRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; notes?: string }) => {
      const response = await api.post('/partner/payouts', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'payouts'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'dashboard'] });
    },
  });
};
