import { SITE_BASE_URL } from './api';
import type { Product } from '@/types/platform';

export function money(value?: number | string) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function roleLabel(role?: string) {
  return String(role || 'customer').replace(/_/g, ' ').toUpperCase();
}

export function productImage(product: Product) {
  const raw = product.images?.[0]?.image_path || product.image_path;
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/storage/')) return `${SITE_BASE_URL}${raw}`;
  if (raw.startsWith('storage/')) return `${SITE_BASE_URL}/${raw}`;
  return `${SITE_BASE_URL}/storage/${raw.replace(/^\/+/, '')}`;
}
