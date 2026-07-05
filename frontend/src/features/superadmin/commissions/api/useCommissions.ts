import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Commission {
  id: number;
  partner_id: number;
  business_id: number;
  plan_id: number | null;
  amount_paid_by_tenant: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_collected_by: 'system' | 'partner';
  paid_at: string | null;
  created_at: string;
  partner?: any;
  business?: any;
  plan?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CommissionQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  partner_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  from_date?: string;
  to_date?: string;
}

export const useCommissions = (params?: CommissionQueryFilters) => {
  return useQuery<PaginatedResponse<Commission>>({
    queryKey: ['superadmin', 'commissions', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/commissions', { params });
      return data;
    },
  });
};

export const useMarkCommissionPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/superadmin/commissions/${id}/mark-paid`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'commissions'] });
    },
  });
};
