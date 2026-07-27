import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';

export interface BookingsFilters {
  search?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  customer_id?: number;
}

export const useBookings = (page = 1, perPage = 15, filters: BookingsFilters = {}) => {
  return useQuery({
    queryKey: ['bookings', page, perPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      const { data } = await api.get(`/business/bookings?${params.toString()}`);
      return data;
    },
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data } = await api.get(`/business/bookings/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: any) => {
      const { data } = await api.post('/business/bookings', bookingData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: cancelData }: { id: number; data?: any }) => {
      const { data } = await api.post(`/business/bookings/${id}/cancel`, cancelData || {});
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useBookingConversionData = (id: number, enabled = false) => {
  return useQuery({
    queryKey: ['bookings', id, 'conversion'],
    queryFn: async () => {
      const { data } = await api.get(`/business/bookings/${id}/conversion-data`);
      return data.data;
    },
    enabled: enabled && !!id,
  });
};

export const useMarkBookingConverted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, saleId }: { id: number; saleId: number }) => {
      const { data } = await api.post(`/business/bookings/${id}/mark-converted`, { sale_id: saleId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const downloadBookingPdf = async (id: number) => {
  return api.get(`/business/bookings/${id}/pdf`, { responseType: 'blob' });
};
