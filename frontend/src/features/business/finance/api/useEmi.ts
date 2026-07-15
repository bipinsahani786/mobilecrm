import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useCustomerEmis(customerId: number | string) {
  return useQuery({
    queryKey: ['customer-emis', customerId],
    queryFn: async () => {
      const response = await api.get(`/business/emis/customer/${customerId}`);
      return response.data.data;
    },
    enabled: !!customerId,
  });
}

export function usePayInstallment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ installmentId, data }: { installmentId: number | string; data: any }) => {
      const response = await api.post(`/business/emis/installments/${installmentId}/pay`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-emis'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['finance-ledger'] });
    },
  });
}

export function useMarkPayoutReceived() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ emiDetailId, data }: { emiDetailId: number | string; data: any }) => {
      const response = await api.post(`/business/emis/${emiDetailId}/payout`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-pending'] });
      queryClient.invalidateQueries({ queryKey: ['finance-completed'] });
      queryClient.invalidateQueries({ queryKey: ['customer-emis'] });
    },
  });
}
