import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Quotation } from '../schemas/quotationSchema';

export interface QuotationFilters {
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export const useQuotations = (page = 1, perPage = 15, filters: QuotationFilters = {}) => {
  return useQuery({
    queryKey: ['quotations', page, perPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const { data } = await api.get(`/business/quotations?${params.toString()}`);
      return data;
    },
  });
};

export const useQuotation = (id: number) => {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/quotations/${id}`);
      return data.data as Quotation;
    },
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationData: any) => {
      const { data } = await api.post('/business/quotations', quotationData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: qData }: { id: number; data: any }) => {
      const { data } = await api.put(`/business/quotations/${id}`, qData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', variables.id] });
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/business/quotations/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useConvertToBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/business/quotations/${id}/convert`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};
