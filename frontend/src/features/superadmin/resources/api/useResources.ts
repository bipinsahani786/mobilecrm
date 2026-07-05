import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PartnerResource {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number;
  is_active: boolean;
  public_url?: string;
  created_at: string;
  updated_at: string;
}

export const usePartnerResources = () => {
  return useQuery<{ data: PartnerResource[] }>({
    queryKey: ['superadmin', 'partner-resources'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/partner-resources');
      return data;
    },
  });
};

export const useCreatePartnerResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/superadmin/partner-resources', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'partner-resources'] });
    },
  });
};

export const useUpdatePartnerResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const { data } = await api.put(`/superadmin/partner-resources/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'partner-resources'] });
    },
  });
};

export const useDeletePartnerResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/superadmin/partner-resources/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'partner-resources'] });
    },
  });
};
