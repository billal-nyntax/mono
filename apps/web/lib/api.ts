const API_URL =
  typeof window !== 'undefined'
    ? '/api/v1'
    : (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1');

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  sellingPrice: number;
  compareAtPrice: number | null;
  images: string[];
  stockQuantity: number;
  status: string;
  model: string | null;
  sku: string | null;
  specifications: Record<string, string> | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'COD' | 'SSLCOMMERZ' | 'BKASH';
  couponCode?: string;
}

export interface CouponValidation {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  description: string | null;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit & { revalidate?: number },
): Promise<T> {
  const { revalidate, ...fetchOptions } = options ?? {};

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!res.ok) {
    try {
      const errorBody = await res.json() as { error?: string; message?: string };
      throw new Error(errorBody.error ?? errorBody.message ?? `Request failed (${String(res.status)})`);
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith('Request failed')) throw e;
      throw new Error(`Request failed (${String(res.status)})`);
    }
  }

  return res.json() as Promise<T>;
}

export async function getProducts(
  params: ProductParams = {},
): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.brandId) searchParams.set('brandId', params.brandId);
  if (params.minPrice) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice) searchParams.set('maxPrice', String(params.maxPrice));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  return fetchApi<PaginatedResponse<Product>>(
    `/shop/products${query ? `?${query}` : ''}`,
    { revalidate: 60 },
  );
}

export async function getProduct(slug: string): Promise<SingleResponse<Product>> {
  return fetchApi<SingleResponse<Product>>(`/shop/products/${slug}`, {
    revalidate: 60,
  });
}

export async function getCategories(): Promise<ListResponse<Category>> {
  return fetchApi<ListResponse<Category>>('/shop/categories', {
    revalidate: 300,
  });
}

export async function getBrands(): Promise<ListResponse<Brand>> {
  return fetchApi<ListResponse<Brand>>('/shop/brands', {
    revalidate: 300,
  });
}

export async function validateCoupon(
  code: string,
  orderTotal: number,
  token: string,
): Promise<SingleResponse<CouponValidation>> {
  return fetchApi<SingleResponse<CouponValidation>>('/shop/coupons/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, orderTotal }),
    revalidate: 0,
  });
}

export interface PaymentInitResult {
  gatewayUrl: string;
  sessionId: string;
}

export async function initiatePayment(
  orderId: string,
  token: string,
): Promise<SingleResponse<PaymentInitResult>> {
  return fetchApi<SingleResponse<PaymentInitResult>>('/payment/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
    revalidate: 0,
  });
}

export async function createOrder(
  data: CreateOrderPayload,
  token: string,
): Promise<SingleResponse<Order>> {
  return fetchApi<SingleResponse<Order>>('/shop/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    revalidate: 0,
  });
}

export async function getUserOrders(
  token: string,
): Promise<ListResponse<Order>> {
  return fetchApi<ListResponse<Order>>('/shop/orders', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    revalidate: 0,
  });
}
