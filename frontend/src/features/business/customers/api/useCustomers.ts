import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Customer } from '../schemas/customerSchema';

export const useCustomers = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: ['customers', page, perPage],
    queryFn: async () => {
      const { data } = await api.get(`/business/customers?page=${page}&per_page=${perPage}`);
      return data;
    },
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/customers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: Partial<Customer>) => {
      const { data } = await api.post('/business/customers', customerData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Customer> }) => {
      const response = await api.put(`/business/customers/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
    },
  });
};
