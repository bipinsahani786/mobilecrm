import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface TemplateRecord {
  id: number;
  name: string;
  type: 'email' | 'whatsapp' | 'sms';
  subject: string | null;
  body: string;
  variables: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useTemplates = (type?: string) => {
  return useQuery<TemplateRecord[]>({
    queryKey: ['superadmin', 'templates', type],
    queryFn: async () => {
      const params = type ? { type } : {};
      const { data } = await api.get('/superadmin/templates', { params });
      return data.data;
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TemplateRecord>) => {
      const response = await api.post('/superadmin/templates', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TemplateRecord> }) => {
      const response = await api.patch(`/superadmin/templates/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'templates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/superadmin/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'templates'] });
    },
  });
};
