import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Brand } from './useBrands';
import type { Category } from './useCategories';

export interface Product {
  id: number;
  business_id: number;
  category_id: number;
  brand_id: number | null;
  model_name: string;
  imei: string | null;
  serial_no: string | null;
  variant: string | null;
  purchase_price: number;
  mrp: number;
  quantity: number;
  supplier_id: number | null;
  status: 'in_stock' | 'sold' | 'damaged';
  category?: Category;
  brand?: Brand;
  created_at: string;
}

export type ProductFormValues = Omit<Product, 'id' | 'business_id' | 'created_at' | 'category' | 'brand'>;

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
  category_id?: number;
  brand_id?: number;
  low_stock_days?: number | string;
}

export function useInventory(params?: InventoryQueryFilters) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const response = await api.get<{ data: Product[]; meta?: any }>('/business/inventory', { params });
      return response.data;
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
