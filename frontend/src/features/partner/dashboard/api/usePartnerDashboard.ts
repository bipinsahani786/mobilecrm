import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PartnerDashboardStats {
  stats: {
    total_referrals: number;
    active_businesses: number;
    total_earned: number;
    paid_amount: number;
    pending_amount: number;
    available_payout: number;
    platform_dues: number;
    total_dues_paid: number;
    net_available_balance: number;
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
  };
  monthly_earnings: { month: string; total: number }[];
  recent_referrals: any[];
  recent_commissions: any[];
}

export const usePartnerDashboard = () => {
  return useQuery<PartnerDashboardStats>({
    queryKey: ['partner', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/partner/dashboard');
      return data.data;
    },
  });
};
