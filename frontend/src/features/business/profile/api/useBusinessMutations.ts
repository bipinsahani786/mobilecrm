import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type { BusinessFormValues } from '../schemas/businessSchema';

export const useCreateBusiness = () => {
  return useMutation({
    mutationFn: async (data: BusinessFormValues) => {
      const response = await api.post('/businesses', data);
      return response.data.data.business;
    },
  });
};

export const useUpdateBusiness = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: BusinessFormValues }) => {
      const response = await api.put(`/businesses/${id}`, data);
      return response.data.data.business;
    },
  });
};
