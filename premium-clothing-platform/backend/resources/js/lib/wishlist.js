import { imageUrl } from '@/lib/cart';

const WISHLIST_KEY = 'iho_wishlist';

export function getWishlistItems() {
  if (typeof window === 'undefined') return [];

  try {
    const items = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveWishlistItems(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: items }));
}

export function isWishlisted(productId) {
  return getWishlistItems().some((item) => String(item.id) === String(productId));
}

export function toggleWishlistItem(product) {
  if (!product?.id) return getWishlistItems();

  const items = getWishlistItems();
  const exists = items.some((item) => String(item.id) === String(product.id));
  const nextItems = exists
    ? items.filter((item) => String(item.id) !== String(product.id))
    : [
        ...items,
        {
          ...product,
          image_path: product.image_path || product.images?.[0]?.image_path || '',
          image: imageUrl(product.image || product.image_path || product.images?.[0]?.image_path),
          price: product.price || product.discount_price || product.base_price || 0,
        },
      ];

  saveWishlistItems(nextItems);
  return nextItems;
}

export function removeWishlistItem(productId) {
  const nextItems = getWishlistItems().filter((item) => String(item.id) !== String(productId));
  saveWishlistItems(nextItems);
  return nextItems;
}
