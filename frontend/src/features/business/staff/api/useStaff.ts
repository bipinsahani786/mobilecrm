import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface StaffMember {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  role: string;
  monthly_salary: number;
  commission_rate: number;
  join_date: string | null;
  status: string;
}

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/business/staff');
      return data.data as StaffMember[];
    },
  });
};

export const useStaffDetail = (id: number) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/staff/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data } = await api.post('/business/staff', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Staff added successfully');
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add staff'),
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Record<string, any>) => {
      const { data } = await api.put(`/business/staff/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Staff updated');
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/business/staff/${id}`);
    },
    onSuccess: () => {
      toast.success('Staff deactivated');
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });
};

export const useStaffSales = (id: number) => {
  return useQuery({
    queryKey: ['staff', id, 'sales'],
    queryFn: async () => {
      const { data } = await api.get(`/business/staff/${id}/sales`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useStaffPermissions = (id: number) => {
  return useQuery({
    queryKey: ['staff', id, 'permissions'],
    queryFn: async () => {
      const { data } = await api.get(`/business/staff/${id}/permissions`);
      return data.data as string[];
    },
    enabled: !!id,
  });
};

export const useUpdateStaffPermissions = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (permissions: string[]) => {
      await api.put(`/business/staff/${id}/permissions`, { permissions });
    },
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      qc.invalidateQueries({ queryKey: ['staff', id, 'permissions'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update permissions'),
  });
};
