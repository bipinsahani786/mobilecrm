import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Customer } from '../schemas/customerSchema';

export interface CustomerFilters {
  search?: string;
  has_udhar?: string;
}

export const useCustomers = (page = 1, perPage = 15, filters: CustomerFilters = {}) => {
  const { search, has_udhar } = filters;
  return useQuery({
    queryKey: ['customers', page, perPage, search, has_udhar],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (search) params.append('search', search);
      if (has_udhar) params.append('has_udhar', has_udhar);

      const { data } = await api.get(`/business/customers?${params.toString()}`);
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
