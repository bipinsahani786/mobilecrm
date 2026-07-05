import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PartnerResource {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number;
  created_at: string;
}

export const usePartnerResources = () => {
  return useQuery<{ data: PartnerResource[] }>({
    queryKey: ['partner', 'resources'],
    queryFn: async () => {
      const { data } = await api.get('/partner/resources');
      return data;
    },
  });
};
