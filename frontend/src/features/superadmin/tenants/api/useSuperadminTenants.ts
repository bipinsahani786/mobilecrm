import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TenantQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'active' | 'suspended';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  all?: boolean;
  from_date?: string;
  to_date?: string;
}

export const useSuperadminTenants = (params?: TenantQueryFilters) => {
  return useQuery<PaginatedResponse<any>>({
    queryKey: ['superadmin', 'businesses', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/businesses', { params });
      return data;
    },
  });
};

export const useUpdateTenantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'suspended' }) => {
      const { data } = await api.patch(`/superadmin/businesses/${id}/status`, { status });
      return data.data.business;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'businesses'] });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/superadmin/businesses/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'businesses'] });
    },
  });
};

export const useResetTenantPassword = () => {
  return useMutation({
    mutationFn: async ({ id, new_password }: { id: number; new_password: string }) => {
      const response = await api.patch(`/superadmin/businesses/${id}/password`, { new_password });
      return response.data;
    },
  });
};
