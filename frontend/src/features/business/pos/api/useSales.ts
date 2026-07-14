import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';
import type { ApiResponse, PaginatedResponse } from '../../../../types/api';
import type { Sale } from '../schemas/saleSchema';

export interface SalesFilters {
  search?: string;
  payment_mode?: string;
  start_date?: string;
  end_date?: string;
  has_udhar?: string;
}

export const useSales = (page = 1, perPage = 15, filters: SalesFilters = {}) => {
  const { search, payment_mode, start_date, end_date, has_udhar } = filters;
  return useQuery({
    queryKey: ['sales', page, perPage, search, payment_mode, start_date, end_date, has_udhar],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (search) params.append('search', search);
      if (payment_mode) params.append('payment_mode', payment_mode);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      if (has_udhar) params.append('has_udhar', has_udhar);

      const { data } = await api.get(`/business/sales?${params.toString()}`);
      return data;
    },
  });
};

export const useSale = (id: number) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Sale>>(`/business/sales/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleData: any) => {
      const { data } = await api.post<ApiResponse<Sale>>('/business/sales', saleData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Stock deducted
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // Customer udhar updated
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put<ApiResponse<Sale>>(`/business/sales/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
