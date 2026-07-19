import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_photo: string | null;
  check_out_photo: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  is_within_geofence: boolean;
  notes: string | null;
  user?: { id: number; name: string };
  approved_by?: number | null;
}

export const useAttendance = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/attendance', { params: filters });
      return data.data;
    },
  });
};

export const useTodayAttendance = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/business/attendance/today');
      return data.data as AttendanceRecord | null;
    },
    enabled: options?.enabled,
  });
};

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { photo: string; latitude?: number; longitude?: number }) => {
      const { data } = await api.post('/business/attendance/check-in', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Checked in successfully!');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Check-in failed'),
  });
};

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { photo: string; latitude?: number; longitude?: number }) => {
      const { data } = await api.post('/business/attendance/check-out', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Checked out successfully!');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Check-out failed'),
  });
};

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: number; date: string; status: string; notes?: string }) => {
      const { data } = await api.post('/business/attendance/mark', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attendance marked');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });
};

export const useAttendanceReport = (month: string) => {
  return useQuery({
    queryKey: ['attendance', 'report', month],
    queryFn: async () => {
      const { data } = await api.get('/business/attendance/report', { params: { month } });
      return data.data;
    },
    enabled: !!month,
  });
};

export const useApproveAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/business/attendance/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attendance approved!');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve attendance'),
  });
};

export const useUnapproveAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/business/attendance/${id}/unapprove`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attendance unapproved!');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to unapprove attendance'),
  });
};

export const useImportAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: any[]) => {
      const { data } = await api.post('/business/attendance/import', { records });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attendance imported successfully!');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to import attendance'),
  });
};
