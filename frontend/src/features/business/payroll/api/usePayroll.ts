import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface PayrollRecord {
  id: number;
  user_id: number;
  month: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  paid_leaves: number;
  unpaid_leaves: number;
  week_offs: number;
  holidays: number;
  base_salary: number;
  per_day_salary: number;
  deduction: number;
  total_commission: number;
  bonus: number;
  advance_deduction: number;
  final_salary: number;
  notes: string | null;
  status: string;
  paid_date: string | null;
  created_at?: string;
  user?: { id: number; name: string; role?: string; email?: string };
  salary_components?: any;
}

export const usePayrolls = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['payrolls', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/payroll', { params: filters });
      return data.data;
    },
  });
};

export const usePayrollDetail = (id: number) => {
  return useQuery({
    queryKey: ['payrolls', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/payroll/${id}`);
      let record = data.data as PayrollRecord;
      if (typeof record.salary_components === 'string') {
        try {
          record.salary_components = JSON.parse(record.salary_components);
        } catch (e) {}
      }
      return record;
    },
    enabled: !!id,
  });
};

export const useGeneratePayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { month: string; user_id?: number }) => {
      const { data } = await api.post('/business/payroll/generate', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Payroll generated');
      qc.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to generate payroll'),
  });
};

export const useUpdatePayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Record<string, any>) => {
      const { data } = await api.put(`/business/payroll/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Payroll updated');
      qc.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });
};

export const useConfirmPayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/business/payroll/${id}/confirm`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Payroll confirmed');
      qc.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });
};

export const useMarkPayrollPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paid_date }: { id: number; paid_date?: string }) => {
      const { data } = await api.post(`/business/payroll/${id}/mark-paid`, { paid_date });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Payroll marked as paid');
      qc.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });
};
