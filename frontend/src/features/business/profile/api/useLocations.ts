import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface BusinessLocation {
  id: number;
  business_id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address: string | null;
  is_default: boolean;
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await api.get('/business/locations');
      return data.data as BusinessLocation[];
    },
  });
};

export const useCreateLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<BusinessLocation, 'id' | 'business_id'>) => {
      const { data } = await api.post('/business/locations', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Location added successfully');
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add location'),
  });
};

export const useUpdateLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Partial<BusinessLocation>) => {
      const { data } = await api.put(`/business/locations/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Location updated successfully');
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update location'),
  });
};

export const useDeleteLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/business/locations/${id}`);
    },
    onSuccess: () => {
      toast.success('Location deleted successfully');
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete location'),
  });
};
