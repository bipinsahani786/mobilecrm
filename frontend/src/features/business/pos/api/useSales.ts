import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';
import type { ApiResponse, PaginatedResponse } from '../../../../types/api';
import type { Sale } from '../schemas/saleSchema';

export const useSales = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: ['sales', page, perPage],
    queryFn: async () => {
      const { data } = await api.get(`/business/sales?page=${page}&per_page=${perPage}`);
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
