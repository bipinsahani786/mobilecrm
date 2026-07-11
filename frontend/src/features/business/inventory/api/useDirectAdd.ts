import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDirectAdd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { product_id: number; quantity: number; purchase_price?: number; mrp?: number; batch_number?: string }) => {
      const response = await api.post('/business/inventory/direct-inward', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
