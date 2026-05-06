export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly phone: string | null;
  readonly role: 'user' | 'admin' | 'super_admin';
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly suspended: boolean;
  readonly suspendedAt: string | null;
  readonly suspendedReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Address {
  readonly id: string;
  readonly userId: string;
  readonly label: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly category: string;
  readonly brandId: string;
  readonly brand: string;
  readonly model: string | null;
  readonly description: string | null;
  readonly purchasePrice: number;
  readonly sellingPrice: number;
  readonly stockQuantity: number;
  readonly sku: string | null;
  readonly images: string[];
  readonly specifications: Record<string, string> | null;
  readonly compareAtPrice: number | null;
  readonly status: 'AVAILABLE' | 'OUT_OF_STOCK';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StockMovement {
  readonly id: string;
  readonly productId: string;
  readonly type: 'IN' | 'OUT' | 'ADJUSTMENT';
  readonly quantity: number;
  readonly reason: string | null;
  readonly performedBy: string | null;
  readonly createdAt: string;
}

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'BANK_TRANSFER';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';

export interface Sale {
  readonly id: string;
  readonly invoiceNumber: string;
  readonly customerName: string | null;
  readonly customerPhone: string | null;
  readonly subtotal: number;
  readonly discount: number;
  readonly totalAmount: number;
  readonly totalProfit: number;
  readonly paidAmount: number;
  readonly dueAmount: number;
  readonly paymentMethod: PaymentMethod;
  readonly paymentStatus: PaymentStatus;
  readonly transactionId: string | null;
  readonly saleDate: string;
  readonly items: SaleItem[];
}

export interface SaleItem {
  readonly id: string;
  readonly productId: string;
  readonly product: { name: string; brand: string };
  readonly quantity: number;
  readonly unitPrice: number;
  readonly purchasePrice: number;
  readonly profit: number;
}

export interface ShopSettings {
  readonly id: string;
  readonly shopName: string;
  readonly shopLogo: string | null;
  readonly currency: string;
  readonly currencySymbol: string;
  readonly lowStockThreshold: number;
}

export interface DashboardData {
  readonly totalProducts: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly todaySalesCount: number;
  readonly todayRevenue: number;
  readonly todayProfit: number;
  readonly totalRevenue: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type OrderPaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

export interface OrderItem {
  readonly id: string;
  readonly productId: string;
  readonly product: {
    readonly id: string;
    readonly name: string;
    readonly brand: { readonly name: string } | string;
  };
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface OrderShippingAddress {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
}

export interface OrderListItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly user: { name: string; email: string; phone: string | null };
  readonly status: OrderStatus;
  readonly paymentMethod: string;
  readonly paymentStatus: OrderPaymentStatus;
  readonly totalAmount: number;
  readonly itemCount: number;
  readonly createdAt: string;
}

export interface Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly user: { name: string; email: string; phone: string | null };
  readonly items: OrderItem[];
  readonly subtotal: number;
  readonly discount: number;
  readonly shippingCost: number;
  readonly totalAmount: number;
  readonly paymentMethod: string;
  readonly paymentStatus: OrderPaymentStatus;
  readonly status: OrderStatus;
  readonly shippingAddress: Record<string, string>;
  readonly couponCode: string | null;
  readonly customerNote: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ReportSummary {
  readonly totalSales: number;
  readonly totalRevenue: number;
  readonly totalProfit: number;
  readonly averageOrderValue: number;
}

export interface BestSeller {
  readonly productId: string;
  readonly productName: string;
  readonly brand: string;
  readonly totalSold: number;
  readonly totalRevenue: number;
}
