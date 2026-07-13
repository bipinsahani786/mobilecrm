import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';
import type { ApiResponse, PaginatedResponse } from '../../../../types/api';
import type { EmiDetail } from '../schemas/financeSchema';

export interface FinanceFilters {
  search?: string;
  financier?: string;
  start_date?: string;
  end_date?: string;
}

export const usePendingPayouts = (page = 1, perPage = 15, filters: FinanceFilters = {}) => {
  const { search, financier, start_date, end_date } = filters;
  return useQuery({
    queryKey: ['finance', 'pending', page, perPage, search, financier, start_date, end_date],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (search) params.append('search', search);
      if (financier) params.append('financier', financier);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      const { data } = await api.get(`/business/finance/pending?${params.toString()}`);
      return data;
    },
  });
};

export const useCompletedPayouts = (page = 1, perPage = 15, filters: FinanceFilters = {}) => {
  const { search, financier, start_date, end_date } = filters;
  return useQuery({
    queryKey: ['finance', 'completed', page, perPage, search, financier, start_date, end_date],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (search) params.append('search', search);
      if (financier) params.append('financier', financier);
      if (start_date) params.append('start_date', start_date);
      if (end_date) params.append('end_date', end_date);
      const { data } = await api.get(`/business/finance/completed?${params.toString()}`);
      return data;
    },
  });
};

export const useMarkPayoutReceived = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payout_date }: { id: number, payout_date?: string }) => {
      const { data } = await api.post<ApiResponse<EmiDetail>>(`/business/finance/${id}/mark-received`, { payout_date });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] }); // Because sale paid_amount is updated
    },
  });
};
