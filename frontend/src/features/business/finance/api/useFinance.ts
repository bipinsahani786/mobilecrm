import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';
import type { ApiResponse, PaginatedResponse } from '../../../../types/api';
import type { EmiDetail } from '../schemas/financeSchema';

export const usePendingPayouts = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: ['finance', 'pending', page, perPage],
    queryFn: async () => {
      const { data } = await api.get(`/business/finance/pending?page=${page}&per_page=${perPage}`);
      return data;
    },
  });
};

export const useCompletedPayouts = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: ['finance', 'completed', page, perPage],
    queryFn: async () => {
      const { data } = await api.get(`/business/finance/completed?page=${page}&per_page=${perPage}`);
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
