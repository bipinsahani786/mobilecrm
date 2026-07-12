import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardStats {
  today_sales: number;
  monthly_revenue: number;
  pending_payments: number;
  staff: {
    active: number;
    present_today: number;
  };
  recent_sales: any[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/business/dashboard/stats');
      return data.data as DashboardStats;
    },
  });
};
