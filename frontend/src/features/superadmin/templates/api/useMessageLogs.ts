import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface MessageLog {
  id: number;
  lead_id: number;
  template_id: number | null;
  type: 'email' | 'whatsapp' | 'sms';
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
  lead?: {
    id: number;
    business_name: string;
    contact_person: string;
    email: string | null;
    phone: string | null;
  };
  template?: {
    id: number;
    name: string;
  };
}

export interface LaravelPaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const useMessageLogs = (params?: { page?: number; per_page?: number; type?: string; status?: string }) => {
  return useQuery<ApiResponse<LaravelPaginatedResponse<MessageLog>>>({
    queryKey: ['superadmin', 'message-logs', params],
    queryFn: async () => {
      const response = await api.get('/superadmin/message-logs', { params });
      return response.data;
    },
  });
};

