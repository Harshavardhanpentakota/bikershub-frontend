// ─────────────────────────────────────────────────────────────
// Centralised API client — all fetch calls go through here.
// JWT token is read from localStorage key "bh_token".
// ─────────────────────────────────────────────────────────────

const BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

// ── Typed error ──────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ── Core fetch wrapper ───────────────────────────────────────
async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('bh_token');

  const headers: Record<string, string> = {
    ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new ApiError(data.message ?? 'API error', res.status);
  return data as T;
}

// ── Shared types (mirrors backend responses) ─────────────────
export interface ApiUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: ApiAddress[];
  wishlist: ApiProduct[];
  createdAt: string;
}

export interface ApiProduct {
  _id: string;
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  badge?: 'new' | 'bestseller' | 'discount';
  compatibleBikes: string[];
  description: string;
  specifications: Record<string, string>;
  inStock: boolean;
  isNew?: boolean;
  stockQuantity: number;
}

export interface ApiAddress {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

export interface ApiOrderItem {
  product: string | ApiProduct;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface ApiOrder {
  _id: string;
  user: string;
  items: ApiOrderItem[];
  shippingAddress: Omit<ApiAddress, '_id'>;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'razorpay' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed';
  razorpayOrderId?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
  createdAt: string;
}

export interface ApiCartItem {
  _id: string;
  product: Pick<ApiProduct, '_id' | 'name' | 'image' | 'price'>;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface ApiCart {
  _id: string;
  user: string;
  items: ApiCartItem[];
}

export interface ApiReview {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  userName: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    req<{ token: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    req<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    req<{ message: string }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    req<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// ── Products ─────────────────────────────────────────────────
export const productsApi = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();
    return req<{ products: ApiProduct[]; total: number; page: number; pages: number }>(
      `/products${qs ? `?${qs}` : ''}`
    );
  },

  getById: (id: string) =>
    req<ApiProduct>(`/products/${id}`),
};

// ── Bikes (brands / models list) ─────────────────────────────
export const bikesApi = {
  getBrands: () => req<{ brands: Record<string, string[]> }>('/bikes'),
};

// ── Cart ─────────────────────────────────────────────────────
export const cartApi = {
  get: () => req<ApiCart>('/cart'),

  add: (data: { productId: string; quantity: number; selectedSize: string; selectedColor: string }) =>
    req<ApiCart>('/cart/add', { method: 'POST', body: JSON.stringify(data) }),

  update: (data: { productId: string; quantity: number }) =>
    req<ApiCart>('/cart/update', { method: 'PUT', body: JSON.stringify(data) }),

  remove: (productId: string) =>
    req<ApiCart>(`/cart/remove/${productId}`, { method: 'DELETE' }),

  clear: () =>
    req<{ message: string }>('/cart/clear', { method: 'DELETE' }),
};

// ── Orders ───────────────────────────────────────────────────
export const ordersApi = {
  place: (data: {
    items: ApiOrderItem[];
    shippingAddress: object;
    shippingMethod: string;
    paymentMethod: string;
  }) => req<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  myList: () => req<ApiOrder[]>('/orders/my'),

  getById: (id: string) => req<ApiOrder>(`/orders/${id}`),

  cancel: (id: string) => req<ApiOrder>(`/orders/${id}/cancel`, { method: 'PUT' }),
};

// ── Users ────────────────────────────────────────────────────
export const usersApi = {
  me: () => req<ApiUser>('/users/me'),

  update: (data: { name?: string; phone?: string }) =>
    req<ApiUser>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    req<{ message: string }>('/users/me/password', { method: 'PUT', body: JSON.stringify(data) }),

  getAddresses: () => req<ApiAddress[]>('/users/me/addresses'),

  addAddress: (data: Omit<ApiAddress, '_id'>) =>
    req<ApiAddress[]>('/users/me/addresses', { method: 'POST', body: JSON.stringify(data) }),

  updateAddress: (id: string, data: Partial<Omit<ApiAddress, '_id'>>) =>
    req<ApiAddress[]>(`/users/me/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteAddress: (id: string) =>
    req<ApiAddress[]>(`/users/me/addresses/${id}`, { method: 'DELETE' }),

  getWishlist: () => req<ApiProduct[]>('/users/me/wishlist'),

  toggleWishlist: (productId: string) =>
    req<{ wishlist: string[]; added: boolean }>(`/users/me/wishlist/${productId}`, { method: 'POST' }),
};

// ── Reviews ──────────────────────────────────────────────────
export const reviewsApi = {
  forProduct: (productId: string) =>
    req<ApiReview[]>(`/reviews/product/${productId}`),

  add: (productId: string, data: { rating: number; comment: string }) =>
    req<ApiReview>(`/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    req<{ message: string }>(`/reviews/${id}`, { method: 'DELETE' }),
};

// ── Payment ──────────────────────────────────────────────────
export const paymentApi = {
  createOrder: (data: { amount: number; orderId: string }) =>
    req<{ razorpayOrderId: string; amount: number }>('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => req<{ success: boolean; message: string }>('/payment/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
