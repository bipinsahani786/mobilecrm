import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PayrollComponent {
  id: number;
  business_id: number;
  name: string;
  type: 'earning' | 'deduction';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useGetPayrollComponents = () => {
  return useQuery({
    queryKey: ['payroll-components'],
    queryFn: async () => {
      const response = await api.get('/business/payroll-components');
      return response.data.data as PayrollComponent[];
    },
  });
};

export const useCreatePayrollComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; type: 'earning' | 'deduction' }) => {
      const response = await api.post('/business/payroll-components', data);
      return response.data.data;
    },
    onSuccess: (newComponent) => {
      queryClient.setQueryData(['payroll-components'], (oldData: PayrollComponent[] | undefined) => {
        if (!oldData) return [newComponent];
        return [...oldData, newComponent];
      });
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useUpdatePayrollComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; type: 'earning' | 'deduction' } }) => {
      const response = await api.put(`/business/payroll-components/${id}`, data);
      return response.data.data;
    },
    onSuccess: (updatedComponent) => {
      queryClient.setQueryData(['payroll-components'], (oldData: PayrollComponent[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(comp => comp.id === updatedComponent.id ? updatedComponent : comp);
      });
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useDeletePayrollComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/business/payroll-components/${id}`);
      return { id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['payroll-components'], (oldData: PayrollComponent[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(comp => comp.id !== data.id);
      });
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};
