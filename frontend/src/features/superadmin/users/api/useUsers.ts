import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface UserRecord {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: 'active' | 'suspended';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: { id: number; name: string }[];
  businesses: { id: number; name: string }[];
}

export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  verified_users: number;
  new_users_30d: number;
  role_counts: Record<string, number>;
}

export interface UserQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ── List users (paginated) ──
export const useUsers = (params?: UserQueryFilters) => {
  return useQuery<PaginatedResponse<UserRecord>>({
    queryKey: ['superadmin', 'users', params],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/users', { params });
      return data;
    },
  });
};

// ── User stats / analytics ──
export const useUserStats = () => {
  return useQuery<{ data: UserStats }>({
    queryKey: ['superadmin', 'users', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/users/stats');
      return data;
    },
  });
};

// ── System roles (dynamic) ──
export interface RoleRecord {
  id: number;
  name: string;
}

export const useRoles = () => {
  return useQuery<{ data: RoleRecord[] }>({
    queryKey: ['superadmin', 'roles'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/users/roles');
      return data;
    },
    staleTime: 5 * 60 * 1000, // roles rarely change, cache 5 min
  });
};

// ── Update user ──
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const response = await api.patch(`/superadmin/users/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
    },
  });
};

// ── Update user status ──
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'suspended' }) => {
      const response = await api.patch(`/superadmin/users/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
    },
  });
};

// ── Create user ──
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await api.post('/superadmin/users', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
    },
  });
};

// ── Delete user (soft-delete) ──
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/superadmin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
    },
  });
};
