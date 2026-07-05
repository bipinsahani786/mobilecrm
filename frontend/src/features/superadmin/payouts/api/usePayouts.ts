import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AdminPayoutRequest {
  id: number;
  partner_id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  notes: string | null;
  admin_notes: string | null;
  approved_at: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  partner?: { id: number; name: string; email: string };
  approved_by_user?: { id: number; name: string };
}

export interface PayoutFilters {
  page?: number;
  per_page?: number;
  status?: string;
  partner_id?: number;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export const useAdminPayouts = (params?: PayoutFilters) => {
  return useQuery({
    queryKey: ['superadmin', 'payouts', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/payouts', { params });
      return data;
    },
  });
};

export const useAdminPayoutStats = () => {
  return useQuery({
    queryKey: ['superadmin', 'payouts', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/payouts/stats');
      return data.data;
    },
  });
};

export const useApprovePayoutRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, admin_notes }: { id: number; admin_notes?: string }) => {
      const response = await api.patch(`/superadmin/payouts/${id}/approve`, { admin_notes });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'payouts'] });
    },
  });
};

export const useRejectPayoutRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, admin_notes }: { id: number; admin_notes?: string }) => {
      const response = await api.patch(`/superadmin/payouts/${id}/reject`, { admin_notes });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'payouts'] });
    },
  });
};

export const useMarkPayoutPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payment_reference, admin_notes }: { id: number; payment_reference: string; admin_notes?: string }) => {
      const response = await api.patch(`/superadmin/payouts/${id}/paid`, { payment_reference, admin_notes });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'payouts'] });
    },
  });
};
