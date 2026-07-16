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
  is_owner?: boolean;
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
    onMutate: async ({ id, ...payload }) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ['staff'] });
      await qc.cancelQueries({ queryKey: ['staff', id] });

      // Snapshot the previous values
      const previousStaffList = qc.getQueryData<StaffMember[]>(['staff']);
      const previousStaffDetail = qc.getQueryData(['staff', id]);

      // Optimistically update the list cache
      if (previousStaffList) {
        qc.setQueryData<StaffMember[]>(
          ['staff'],
          previousStaffList.map((member) =>
            member.id === id ? { ...member, ...payload } : member
          )
        );
      }

      // Optimistically update the detail cache
      if (previousStaffDetail) {
        qc.setQueryData(['staff', id], (prev: any) => ({ ...prev, ...payload }));
      }

      return { previousStaffList, previousStaffDetail, id };
    },
    onError: (err: any, variables, context) => {
      // Roll back to snapshotted state
      if (context?.previousStaffList) {
        qc.setQueryData(['staff'], context.previousStaffList);
      }
      if (context?.previousStaffDetail && context?.id) {
        qc.setQueryData(['staff', context.id], context.previousStaffDetail);
      }
      toast.error(err.response?.data?.message || 'Failed to update');
    },
    onSuccess: () => {
      toast.success('Staff updated');
    },
    onSettled: (data, error, variables) => {
      qc.invalidateQueries({ queryKey: ['staff'] });
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ['staff', variables.id] });
      }
    },
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

export const useStaffEarningsById = (id: number) => {
  return useQuery({
    queryKey: ['staff_earnings', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/staff/${id}/earnings`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useImpersonateStaff = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/business/staff/${id}/impersonate`);
      return data;
    },
    onSuccess: () => {
      toast.success('Impersonating staff member');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to impersonate');
    },
  });
};
