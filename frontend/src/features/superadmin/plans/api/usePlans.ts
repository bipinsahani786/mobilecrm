import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, any> | null;
  is_active: boolean;
  businesses_count?: number;
  created_at: string;
}

export type PlanFormValues = Omit<Plan, 'id' | 'created_at' | 'businesses_count'>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PlanQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  all?: boolean;
}

export const usePlans = (params?: PlanQueryFilters) => {
  return useQuery<PaginatedResponse<Plan>>({
    queryKey: ['superadmin', 'plans', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/plans', { params });
      return data;
    },
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PlanFormValues) => {
      const response = await api.post('/superadmin/plans', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'plans'] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PlanFormValues> }) => {
      const response = await api.put(`/superadmin/plans/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'plans'] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/superadmin/plans/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'plans'] });
    },
  });
};
