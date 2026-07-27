import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';

export interface SaleReturnsFilters {
  search?: string;
  refund_type?: string;
  from_date?: string;
  to_date?: string;
  sale_id?: number;
  customer_id?: number;
}

export const useSaleReturns = (page = 1, perPage = 15, filters: SaleReturnsFilters = {}) => {
  return useQuery({
    queryKey: ['sale-returns', page, perPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (filters.search) params.append('search', filters.search);
      if (filters.refund_type) params.append('refund_type', filters.refund_type);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      const { data } = await api.get(`/business/sale-returns?${params.toString()}`);
      return data;
    },
  });
};





export const useSaleReturn = (id: number) => {
  return useQuery({
    queryKey: ['sale-returns', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/sale-returns/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useReturnableItems = (saleId: number) => {
  return useQuery({
    queryKey: ['sale-returns', 'returnable', saleId],
    queryFn: async () => {
      const { data } = await api.get(`/business/sale-returns/returnable-items/${saleId}`);
      return data.data;
    },
    enabled: !!saleId,
  });
};

export const useCreateSaleReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (returnData: any) => {
      const { data } = await api.post('/business/sale-returns', returnData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-returns'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

