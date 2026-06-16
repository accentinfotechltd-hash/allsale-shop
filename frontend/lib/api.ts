import { BACKEND_URL } from "./utils";

export type ApiOptions = RequestInit & { auth?: boolean; token?: string };

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("allsale_token");
}

export async function apiFetch<T = any>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { auth, token, headers, ...rest } = opts;
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };
  const t = token ?? (auth ? getToken() : null);
  if (t) finalHeaders["Authorization"] = `Bearer ${t}`;

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    cache: rest.cache ?? "no-store",
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || body.message || JSON.stringify(body);
    } catch {}
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ---------- typed endpoints ----------
export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price_nzd: number;
  price_inr?: number;
  image: string;
  images: string[];
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  stock_count: number;
  colors?: string[];
  sizes?: string[];
  shipping_days_min?: number;
  shipping_days_max?: number;
  origin?: string;
  seller_id?: string;
  seller_name?: string;
  seller_city?: string | null;
};

export type Category = string;

export type Taxonomy = { key: string; name: string; blurb: string; subcategories: string[] };

export type GeoDetect = {
  country: string;
  name: string;
  currency: string;
  symbol: string;
  supported: boolean;
};

export type CurrencyRates = {
  base: string;
  rates: Record<string, number>;
  countries: { code: string; name: string; currency: string; symbol: string; flag: string }[];
};

export type CartItem = {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  price_nzd: number;
  original_price_nzd?: number;
  category?: string;
  seller_id?: string;
};

export type Cart = {
  items: CartItem[];
  subtotal_nzd: number;
  shipping_nzd: number;
  discount_nzd: number;
  total_nzd: number;
  subtotal_inr?: number;
  coupon_code?: string | null;
  coupon_label?: string | null;
  points_used?: number;
  points_discount_nzd?: number;
  points_balance?: number;
  points_max_usable?: number;
};

export const api = {
  // public
  products: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    return apiFetch<Product[]>(`/api/products?${qs.toString()}`);
  },
  product: (id: string) => apiFetch<Product>(`/api/products/${id}`),
  recommendations: (id: string) => apiFetch<Product[]>(`/api/products/${id}/recommendations`),
  categories: () => apiFetch<Category[]>(`/api/categories`),
  taxonomy: () => apiFetch<Taxonomy[]>(`/api/taxonomy`),
  geo: () => apiFetch<GeoDetect>(`/api/geo/detect`),
  rates: () => apiFetch<CurrencyRates>(`/api/currency/rates`),

  // auth
  register: (body: { email: string; password: string; full_name: string; country: string }) =>
    apiFetch<{ access_token: string }>(`/api/auth/register`, { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch<{ access_token?: string; two_factor_required?: boolean; email?: string }>(`/api/auth/login`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  loginVerify: (body: { email: string; otp: string }) =>
    apiFetch<{ access_token: string }>(`/api/auth/2fa/login-verify`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  googleSession: (session_id: string) =>
    apiFetch<{ access_token: string }>(`/api/auth/google-session`, {
      method: "POST",
      body: JSON.stringify({ session_id }),
    }),
  me: (token?: string) => apiFetch<any>(`/api/auth/me`, { auth: true, token }),

  // cart (auth required)
  getCart: () => apiFetch<Cart>(`/api/cart`, { auth: true }),
  updateCart: (body: { product_id: string; quantity: number; action: "add" | "set" | "remove" }) =>
    apiFetch<Cart>(`/api/cart`, { method: "POST", auth: true, body: JSON.stringify(body) }),
  applyCoupon: (code: string) =>
    apiFetch<Cart>(`/api/cart/coupon`, { method: "POST", auth: true, body: JSON.stringify({ code }) }),

  // checkout
  checkoutSession: (body: {
    origin_url: string;
    currency: string;
    country: string;
    shipping_tier?: string;
    shipping_courier_id?: string;
  }) =>
    apiFetch<{ url: string; session_id: string }>(`/api/checkout/session`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),
  checkoutStatus: (session_id: string) =>
    apiFetch<{ status: string; payment_status?: string; order_id?: string }>(`/api/checkout/status/${session_id}`, {
      auth: true,
    }),

  // orders
  orders: () => apiFetch<any[]>(`/api/orders`, { auth: true }),
  order: (id: string) => apiFetch<any>(`/api/orders/${id}`, { auth: true }),

  // wishlist
  wishlist: () => apiFetch<any[]>(`/api/wishlist`, { auth: true }),
  toggleWishlist: (product_id: string) =>
    apiFetch<any>(`/api/wishlist/${product_id}`, { method: "POST", auth: true }),

  // misc
  shippingQuote: (params: { country: string; weight_kg: number; currency: string; subtotal: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/api/shipping/quote?${qs}`);
  },
};
