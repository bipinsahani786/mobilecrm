import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useAuditLogs = (filters: any) => {
  return useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/activity-logs', { params: filters });
      return data;
    },
  });
};
