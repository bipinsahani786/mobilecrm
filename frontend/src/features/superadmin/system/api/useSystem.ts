import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useLogs = () => {
  return useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system/logs');
      return response.data.data.logs;
    },
    refetchInterval: 10000, // Poll every 10s
  });
};

export const useClearLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/superadmin/system/logs');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
      toast.success('System logs cleared successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clear logs');
    },
  });
};

export const useClearCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/superadmin/system/cache/clear');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
      toast.success('Application cache cleared successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clear cache');
    },
  });
};

export const useOptimizeApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/superadmin/system/cache/optimize');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
      toast.success('Application optimized successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to optimize application');
    },
  });
};
