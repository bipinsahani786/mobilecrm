import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { EXPENSE_QUERY_KEYS } from '../constants';
import type { Expense } from '../schemas';
import { toast } from 'sonner';

// Fetch paginated expenses
export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data } = await api.get('/business/expenses/categories');
      // The API returns { success: true, data: [{id: 1, name: 'Rent'}, ...] }
      return data.data as { id: number; name: string }[];
    },
  });
};

export const useExpenses = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: EXPENSE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await api.get('/business/expenses', { params: filters });
      return response.data;
    },
  });
};

export const useExpenseAnalytics = (dateFilter: string = 'monthly') => {
  return useQuery({
    queryKey: ['expense-analytics', dateFilter],
    queryFn: async () => {
      const { data } = await api.get('/business/expenses/analytics', {
        params: { date_filter: dateFilter }
      });
      return data.data;
    },
  });
};

// Create expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      // Must use multipart/form-data for file upload
      const response = await api.post('/business/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Expense created successfully');
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create expense');
    },
  });
};

// Update expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // Laravel uses POST with _method=PUT for multipart/form-data updates
      data.append('_method', 'PUT');
      const response = await api.post(`/business/expenses/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Expense updated successfully');
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    },
  });
};

// Delete expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/business/expenses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    },
  });
};
