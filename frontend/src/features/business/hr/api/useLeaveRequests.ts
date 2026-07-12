import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface LeaveRequest {
  id: number;
  user_id: number;
  business_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  created_at: string;
  user?: { id: number; name: string };
  approved_by_user?: { id: number; name: string };
}

export const useLeaveRequests = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['leave-requests', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/leave-requests', { params: filters });
      return data.data as LeaveRequest[];
    },
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<LeaveRequest, 'id' | 'business_id' | 'user_id' | 'status' | 'created_at'>) => {
      const { data } = await api.post('/business/leave-requests', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'approved' | 'rejected' }) => {
      const { data } = await api.patch(`/business/leave-requests/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave status');
    }
  });
};
