import { api } from './api';
import type { Category, Product } from '@/types/platform';

export async function fetchCategories() {
  const response = await api.get<{ data: Category[] }>('/categories');
  return response.data?.data || [];
}

export async function fetchProducts(params: Record<string, string | number | undefined> = {}) {
  const response = await api.get('/products', {
    params: {
      per_page: 30,
      ...params,
    },
  });

  return (response.data?.data?.data || response.data?.data || []) as Product[];
}
