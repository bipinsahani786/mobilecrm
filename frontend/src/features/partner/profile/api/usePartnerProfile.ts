import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PartnerProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  referral_code: string;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  payout_details: {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_holder_name?: string;
    upi_id?: string;
  } | null;
  status: boolean;
  user?: any;
}

export const usePartnerProfile = () => {
  return useQuery<PartnerProfile>({
    queryKey: ['partner', 'profile'],
    queryFn: async () => {
      const { data } = await api.get('/partner/profile');
      return data.data;
    },
  });
};

export const useUpdatePartnerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; phone?: string; company_name?: string }) => {
      const response = await api.patch('/partner/profile', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'profile'] });
    },
  });
};

export const useUpdatePayoutDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bank_name?: string;
      account_number?: string;
      ifsc_code?: string;
      account_holder_name?: string;
      upi_id?: string;
    }) => {
      const response = await api.patch('/partner/payout-details', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'profile'] });
    },
  });
};

export const useChangePartnerPassword = () => {
  return useMutation({
    mutationFn: async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
      const response = await api.post('/partner/change-password', data);
      return response.data;
    },
  });
};
