import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useStaffPerformance = (filters: { from_date: string; to_date: string }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['staff-performance', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/staff/performance', { params: filters });
      return data.data; // Because it returns { data: [...] }
    },
    enabled: options?.enabled,
  });
};
