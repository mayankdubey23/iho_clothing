export type RecentProduct = {
  id: number | string;
  slug?: string;
  name: string;
  price?: number | string;
  base_price?: number | string;
  image_path?: string | null;
  images?: Array<{ url?: string | null; image_path?: string | null }>;
};

let recentProducts: RecentProduct[] = [];

export function addRecentProduct(product: RecentProduct) {
  recentProducts = [
    product,
    ...recentProducts.filter((item) => String(item.id) !== String(product.id)),
  ].slice(0, 8);
}

export function getRecentProducts() {
  return recentProducts;
}
