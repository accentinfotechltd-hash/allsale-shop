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
      detail = extractErrorMessage(body) || detail;
    } catch {}
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Turn FastAPI / generic JSON error bodies into a readable string.
function extractErrorMessage(body: any): string | null {
  if (!body) return null;
  if (typeof body === "string") return body;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail
      .map((d: any) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
      .join("; ");
  }
  if (typeof body.message === "string") return body.message;
  try {
    return JSON.stringify(body);
  } catch {
    return null;
  }
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
  // Backend contract: POST /api/cart ADDS abs(quantity) to existing line.
  // To set or decrement, the client must DELETE then re-POST.
  cartAdd: (product_id: string, quantity = 1) =>
    apiFetch<Cart>(`/api/cart`, { method: "POST", auth: true, body: JSON.stringify({ product_id, quantity }) }),
  cartRemove: (product_id: string) =>
    apiFetch<Cart>(`/api/cart/${product_id}`, { method: "DELETE", auth: true }),
  cartSet: async (product_id: string, quantity: number): Promise<Cart> => {
    await apiFetch(`/api/cart/${product_id}`, { method: "DELETE", auth: true });
    if (quantity <= 0) return api.getCart();
    return apiFetch<Cart>(`/api/cart`, { method: "POST", auth: true, body: JSON.stringify({ product_id, quantity }) });
  },
  applyCoupon: (code: string) =>
    apiFetch<Cart>(`/api/cart/coupon`, { method: "POST", auth: true, body: JSON.stringify({ code }) }),

  // checkout
  checkoutSession: (body: {
    origin_url: string;
    currency: string;
    country: string;
    address: ShippingAddress;
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

  // ============ SELLER ============
  sellerMe: () => apiFetch<any>(`/api/seller/me`, { auth: true }),
  sellerStatus: () => apiFetch<any>(`/api/seller/me/status`, { auth: true }),
  sellerUpgrade: (business: any) =>
    apiFetch<any>(`/api/seller/upgrade`, { method: "POST", auth: true, body: JSON.stringify({ business }) }),
  sellerSettings: () => apiFetch<any>(`/api/seller/profile/settings`, { auth: true }),
  sellerSettingsUpdate: (body: any) =>
    apiFetch<any>(`/api/seller/profile/settings`, { method: "PATCH", auth: true, body: JSON.stringify(body) }),
  sellerProducts: () => apiFetch<Product[]>(`/api/seller/products`, { auth: true }),
  sellerCreateProduct: (body: any) =>
    apiFetch<Product>(`/api/seller/products`, { method: "POST", auth: true, body: JSON.stringify(body) }),
  sellerUpdateProduct: (id: string, body: any) =>
    apiFetch<Product>(`/api/seller/products/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(body) }),
  sellerDeleteProduct: (id: string) =>
    apiFetch<any>(`/api/seller/products/${id}`, { method: "DELETE", auth: true }),
  sellerOrders: () => apiFetch<any[]>(`/api/seller/orders`, { auth: true }),
  sellerPayouts: () => apiFetch<any>(`/api/seller/payouts`, { auth: true }),
  sellerTier: () => apiFetch<any>(`/api/seller/tier`, { auth: true }),
  sellerWallet: () => apiFetch<any>(`/api/wallet`, { auth: true }),
  sellerUploadDocument: async (type: "id_proof" | "business_proof", file: File) => {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    const url = `${BACKEND_URL}/api/seller/documents`;
    const token = typeof window !== "undefined" ? window.localStorage.getItem("allsale_token") : null;
    const res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const t = await res.text();
      throw new ApiError(t || `HTTP ${res.status}`, res.status);
    }
    return res.json();
  },

  // ============ ADMIN ============
  // Admin uses a separate JWT stored at localStorage['allsale_admin_token']
  adminLogin: (email: string, password: string) =>
    apiFetch<{ access_token: string; admin: any }>(`/api/admin/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  adminMe: (token?: string) => apiFetchAdmin<any>(`/api/admin/me`, { token }),
  adminOverview: () => apiFetchAdmin<any>(`/api/admin/overview`),
  adminUsers: async () => {
    const r = await apiFetchAdmin<any>(`/api/admin/users`);
    return (Array.isArray(r) ? r : r?.users ?? []) as any[];
  },
  adminOrders: async (limit = 50) => {
    const r = await apiFetchAdmin<any>(`/api/admin/orders?limit=${limit}`);
    return (Array.isArray(r) ? r : r?.orders ?? []) as any[];
  },
  adminSellers: async () => {
    const r = await apiFetchAdmin<any>(`/api/admin/sellers`);
    return (Array.isArray(r) ? r : r?.sellers ?? []) as any[];
  },
  adminSellersPending: async () => {
    const r = await apiFetchAdmin<any>(`/api/admin/sellers/pending`);
    return (Array.isArray(r) ? r : r?.sellers ?? r?.pending ?? []) as any[];
  },
  adminApproveSeller: (user_id: string) =>
    apiFetchAdmin<any>(`/api/admin/sellers/${user_id}/approve`, { method: "POST" }),
  adminRejectSeller: (user_id: string, reason: string) =>
    apiFetchAdmin<any>(`/api/admin/sellers/${user_id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  adminPayouts: (status = "available") => apiFetchAdmin<any>(`/api/admin/payouts?status=${status}`),
  adminMarkPayoutPaid: (id: string) =>
    apiFetchAdmin<any>(`/api/admin/payouts/${id}/mark-paid`, { method: "POST" }),
  adminTeam: async () => {
    const r = await apiFetchAdmin<any>(`/api/admin/team`);
    return (Array.isArray(r) ? r : r?.team ?? r?.admins ?? []) as any[];
  },
  adminTeamRoles: () => apiFetchAdmin<any>(`/api/admin/team/roles`),
  adminCreateAdmin: (body: { email: string; full_name: string; role: string }) =>
    apiFetchAdmin<any>(`/api/admin/team`, { method: "POST", body: JSON.stringify(body) }),
  adminUpdateAdmin: (id: string, body: any) =>
    apiFetchAdmin<any>(`/api/admin/team/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  adminResetPassword: (id: string) =>
    apiFetchAdmin<any>(`/api/admin/team/${id}/reset-password`, { method: "POST" }),
  adminDeleteAdmin: (id: string) =>
    apiFetchAdmin<any>(`/api/admin/team/${id}`, { method: "DELETE" }),
  adminActivityLog: async () => {
    const r = await apiFetchAdmin<any>(`/api/admin/activity-log`);
    return (Array.isArray(r) ? r : r?.events ?? r?.entries ?? r?.log ?? []) as any[];
  },
};

// Helper for admin endpoints (uses allsale_admin_token)
export async function apiFetchAdmin<T = any>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = opts;
  const t = token ?? (typeof window !== "undefined" ? window.localStorage.getItem("allsale_admin_token") : null);
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };
  if (t) finalHeaders["Authorization"] = `Bearer ${t}`;
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, { ...rest, headers: finalHeaders, cache: "no-store" });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = (function () {
        if (!body) return null;
        if (typeof body === "string") return body;
        if (typeof body.detail === "string") return body.detail;
        if (Array.isArray(body.detail)) {
          return body.detail
            .map((d: any) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
            .join("; ");
        }
        if (typeof body.message === "string") return body.message;
        try {
          return JSON.stringify(body);
        } catch {
          return null;
        }
      })() || detail;
    } catch {}
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
