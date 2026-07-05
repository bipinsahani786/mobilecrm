import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SuperadminDashboardFilters {
  from_date?: string;
  to_date?: string;
}

export interface DashboardSummary {
  total_revenue: number;
  commissions_paid: number;
  commissions_pending: number;
  net_profit: number;
  active_businesses: number;
  sales_partners: number;
  total_users: number;
}

export interface TrendItem {
  month: string;
  revenue: number;
  profit: number;
}

export interface ProfitDistribution {
  revenue: number;
  commissions: number;
  profit: number;
}

export interface BestPartner {
  id: number;
  name: string;
  company_name: string | null;
  referrals_count: number;
  leads_count: number;
  earnings: number;
}

export interface BestPlan {
  id: number;
  name: string;
  price_monthly: number;
  price_yearly: number;
  subscribers_count: number;
  mrr: number;
}

export interface LeadFunnel {
  total: number;
  contacted: number;
  converted: number;
  contacted_rate: number;
  conversion_rate: number;
}

export interface ExpiringSubscription {
  id: number;
  name: string;
  plan_name: string;
  expires_at: string | null;
  partner_name: string;
}

export interface DashboardStatsResponse {
  summary: DashboardSummary;
  trend: TrendItem[];
  profit_distribution: ProfitDistribution;
  best_partners: BestPartner[];
  best_plans: BestPlan[];
  lead_funnel: LeadFunnel;
  expiring_subscriptions: ExpiringSubscription[];
}

export const useSuperadminDashboardStats = (params?: SuperadminDashboardFilters) => {
  return useQuery<DashboardStatsResponse>({
    queryKey: ['superadmin', 'dashboard', 'stats', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/dashboard/stats', { params });
      return data.data;
    },
  });
};
