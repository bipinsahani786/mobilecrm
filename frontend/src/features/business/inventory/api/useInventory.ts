import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Category } from './useCategories';

export interface Product {
  id: number;
  business_id: number;
  category_id: number;
  brand: string;
  model_name: string;
  imei: string | null;
  serial_no: string | null;
  variant: string | null;
  purchase_price: number;
  mrp: number;
  quantity: number;
  supplier_id: number | null;
  status: string;
  category?: Category;
  created_at: string;
}

export type ProductFormValues = Omit<Product, 'id' | 'business_id' | 'created_at' | 'category'>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface InventoryQueryFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export function useInventory(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const response = await api.get<{ data: Product[]; meta?: any }>('/business/inventory', { params });
      return response.data;
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['inventory-brands'],
    queryFn: async () => {
      const response = await api.get<string[]>('/business/inventory/brands');
      return response.data?.data || response.data || [];
    },
  });
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await api.post('/business/inventory', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'inventory'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductFormValues> }) => {
      const response = await api.patch(`/business/inventory/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'inventory'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/business/inventory/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'inventory'] });
    },
  });
};
