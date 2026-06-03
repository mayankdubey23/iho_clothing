export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
  status?: string;
};

export type AuthResponse = {
  status?: boolean;
  success?: boolean;
  message?: string;
  token?: string;
  user?: ApiUser;
  challenge_id?: string;
  dev_otp?: string;
  requires_otp?: boolean;
  data?: {
    token?: string;
    user?: ApiUser;
  };
};

export type ApiErrorResponse = {
  message?: string;
  challenge_id?: string;
  dev_otp?: string;
  requires_otp?: boolean;
};

export type Category = {
  id: number | string;
  name: string;
  slug?: string;
  products_count?: number;
};

export type Product = {
  id: number | string;
  name: string;
  slug?: string;
  description?: string;
  base_price?: number | string;
  price?: number | string;
  mrp?: number | string;
  compare_at_price?: number | string;
  image_path?: string | null;
  images?: Array<{ image_path?: string | null }>;
  category?: Category | string;
  category_name?: string;
  gender?: string;
  is_featured?: boolean;
  is_best_seller?: boolean;
};
