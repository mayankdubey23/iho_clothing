import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { fetchCategories, fetchProducts } from './catalog';
import type { Category, Product } from '@/types/platform';

export function useCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCategories, nextProducts] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(nextCategories);
      setProducts(nextProducts);
    } catch (error) {
      console.log('Catalog API Error:', error);
      Alert.alert('Catalog Error', 'Could not load storefront data from Laravel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.is_featured || product.is_best_seller).slice(0, 8),
    [products],
  );

  return {
    categories,
    products,
    featuredProducts: featuredProducts.length ? featuredProducts : products.slice(0, 8),
    loading,
    refreshing,
    refresh,
  };
}
