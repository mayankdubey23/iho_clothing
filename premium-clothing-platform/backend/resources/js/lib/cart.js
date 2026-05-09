const CART_KEY = 'iho_cart';

export function getCartItems() {
  if (typeof window === 'undefined') return [];

  try {
    const items = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
}

export function addCartItem(item) {
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
