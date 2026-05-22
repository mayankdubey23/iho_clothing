const CART_KEY = 'iho_cart';
const CART_VERSION_KEY = 'iho_cart_version';
const CART_VERSION = 'checkout-v2';

function ensureCartVersion() {
  if (typeof window === 'undefined') return true;

  const version = window.localStorage.getItem(CART_VERSION_KEY);
  if (version === CART_VERSION) return true;

  window.localStorage.setItem(CART_VERSION_KEY, CART_VERSION);
  window.localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: [] }));
  return false;
}

export function imageUrl(path) {
  if (!path) return '';
  const value = String(path);
  if (value.startsWith('http') || value.startsWith('/storage/')) return value;
  return `/storage/${value.replace(/^\/+/, '').replace(/^storage\//, '')}`;
}

function skuStock(sku) {
  if (!sku) return 0;
  if (sku.inventory) return Number(sku.inventory.stock_quantity || 0);
  if (Array.isArray(sku.inventories)) {
    return sku.inventories
      .filter((inventory) => inventory.franchise_id === null || inventory.franchise_id === undefined)
      .reduce((total, inventory) => total + Number(inventory.stock_quantity || 0), 0);
  }
  return 0;
}

export function firstAvailableSku(product) {
  const skus = Array.isArray(product?.skus) ? product.skus : [];
  return skus.find((sku) => skuStock(sku) > 0) || skus[0] || null;
}

export function buildCartItemFromProduct(product, quantity = 1) {
  if (!product?.id) return null;

  const sku = firstAvailableSku(product);
  if (!sku?.id) return null;

  const size = sku.size || product.available_sizes?.[0]?.code;
  const color = sku.color || product.available_colors?.[0]?.name;
  if (!size || !color) return null;

  const image = imageUrl(
    product.image
      || product.image_path
      || product.images?.[0]?.image_path
  );

  return {
    id: sku.id,
    product_id: product.id,
    sku_id: sku.id,
    name: product.name,
    slug: product.slug,
    size,
    color,
    price: Number(product.discount_price || product.price || product.base_price || 0),
    quantity: Number(quantity || 1),
    image,
  };
}

export function getCartItems() {
  if (typeof window === 'undefined') return [];
  if (!ensureCartVersion()) return [];

  try {
    const items = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(items)) return [];

    const normalized = normalizeCartItems(items);
    if (JSON.stringify(normalized) !== JSON.stringify(items)) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: normalized }));
    }

    return normalized;
  } catch {
    return [];
  }
}

export function saveCartItems(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_VERSION_KEY, CART_VERSION);
  const normalized = normalizeCartItems(items);
  window.localStorage.setItem(CART_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: normalized }));
}

export function normalizeCartItems(items = []) {
  const merged = new Map();

  items.forEach((item) => {
    const skuId = item?.sku_id;
    const productId = item?.product_id;
    const size = String(item?.size || '').trim();
    const color = String(item?.color || '').trim();

    if (!skuId || !productId || !item?.name || Number(item?.price || 0) <= 0) {
      return;
    }

    if (!size || !color || size.toLowerCase() === 'default' || color.toLowerCase() === 'default') {
      return;
    }

    const key = String(skuId);
    const quantity = Math.max(1, Number(item.quantity || 1));
    const normalizedItem = {
      ...item,
      id: skuId,
      sku_id: skuId,
      product_id: productId,
      quantity,
      size,
      color,
      image: imageUrl(item.image || item.image_path),
    };

    if (merged.has(key)) {
      const existing = merged.get(key);
      merged.set(key, {
        ...existing,
        ...normalizedItem,
        quantity: Number(existing.quantity || 1) + quantity,
      });
    } else {
      merged.set(key, normalizedItem);
    }
  });

  return Array.from(merged.values());
}

export function addCartItem(item) {
  if (!item?.sku_id) return getCartItems();

  const items = getCartItems();
  const existingIndex = items.findIndex((cartItem) => String(cartItem.sku_id) === String(item.sku_id));

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: Number(items[existingIndex].quantity || 1) + Number(item.quantity || 1),
    };
  } else {
    items.push({ ...item, quantity: Number(item.quantity || 1) });
  }

  saveCartItems(items);
  return items;
}

export function updateCartItemQuantity(skuId, quantity) {
  const nextQuantity = Number(quantity);
  const items = getCartItems().map((item) => (
    String(item.sku_id) === String(skuId)
      ? { ...item, quantity: Math.max(nextQuantity, 1) }
      : item
  ));

  saveCartItems(items);
  return items;
}

export function removeCartItem(skuId) {
  const items = getCartItems().filter((item) => String(item.sku_id) !== String(skuId));
  saveCartItems(items);
  return items;
}

export function clearCart() {
  saveCartItems([]);
}
