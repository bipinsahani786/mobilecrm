import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Plan {
  id: number;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

export interface OnboardClientPayload {
  owner_name: string;
  owner_email: string;
  owner_password?: string;
  business_name: string;
  plan_id?: number;
  payment_method: 'online' | 'offline';
  amount_paid?: number;
}

export const useGetActivePlans = () => {
  return useQuery({
    queryKey: ['partner-plans'],
    queryFn: async () => {
      const { data } = await api.get('/partner/plans');
      return data;
    },
  });
};

export const useOnboardClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OnboardClientPayload) => {
      const { data } = await api.post('/partner/clients/onboard', payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate the referrals list so the new client appears immediately
      queryClient.invalidateQueries({ queryKey: ['partner-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['partner-dashboard-stats'] });
    },
  });
};
