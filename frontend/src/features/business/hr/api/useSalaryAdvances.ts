import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface SalaryAdvance {
  id: number;
  user_id: number;
  business_id: number;
  amount: number;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'deducted';
  approved_by?: number;
  created_at: string;
  user?: { id: number; name: string };
}

export const useSalaryAdvances = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['salary-advances', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/salary-advances', { params: filters });
      return data.data as SalaryAdvance[];
    },
  });
};

export const useCreateSalaryAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number, date: string, reason: string }) => {
      const { data } = await api.post('/business/salary-advances', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-advances'] });
      toast.success('Salary advance requested successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to request salary advance');
    }
  });
};
