import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { PrismaService } from '@repo/database';
import { AuthService } from '@repo/auth-core';
import { MailService } from '@repo/mailer';
import { ShopController } from '../shop/shop.controller';
import { ShopService } from '../shop/shop.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GlobalExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseWrapperInterceptor } from '../common/interceptors/response-wrapper.interceptor';

const MOCK_USER = {
  id: 'user-1',
  email: 'shopper@example.com',
  name: 'Test Shopper',
  phone: '+8801700000000',
  role: 'user' as const,
  emailVerified: true,
  twoFactorEnabled: false,
  suspended: false,
  suspendedAt: null,
  suspendedReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_SESSION = {
  id: 'session-1',
  userId: 'user-1',
  token: 'valid-token',
  expiresAt: new Date(Date.now() + 3600_000),
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
};

function toDecimal(n: number) {
  return {
    toNumber: () => n,
    mul: (x: number | ReturnType<typeof toDecimal>) => {
      const val = typeof x === 'number' ? x : x.toNumber();
      return toDecimal(n * val);
    },
    add: (other: ReturnType<typeof toDecimal>) => toDecimal(n + other.toNumber()),
    sub: (other: ReturnType<typeof toDecimal>) => toDecimal(n - other.toNumber()),
    div: (x: number) => toDecimal(n / x),
    lt: (other: ReturnType<typeof toDecimal>) => n < other.toNumber(),
    gt: (other: ReturnType<typeof toDecimal>) => n > other.toNumber(),
  };
}

const MOCK_PRODUCT_RAW = {
  id: 'prod-1',
  name: 'Samsung Galaxy S24',
  slug: 'samsung-galaxy-s24',
  description: 'Flagship smartphone',
  sellingPrice: toDecimal(89990),
  compareAtPrice: toDecimal(99990),
  stockQuantity: 10,
  images: ['s24-1.jpg', 's24-2.jpg'],
  status: 'AVAILABLE',
  model: 'SM-S921B',
  sku: 'SAM-S24-001',
  specifications: { display: '6.2"', battery: '4000mAh' },
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-15'),
  category: { id: 'cat-1', name: 'Smartphones', slug: 'smartphones' },
  brand: { id: 'brand-1', name: 'Samsung', slug: 'samsung' },
};

const MOCK_CATEGORY = {
  id: 'cat-1',
  name: 'Smartphones',
  slug: 'smartphones',
  icon: 'phone',
  _count: { products: 5 },
};

const MOCK_BRAND = {
  id: 'brand-1',
  name: 'Samsung',
  slug: 'samsung',
  logo: 'samsung.png',
  _count: { products: 3 },
};

const MOCK_ORDER_RAW = {
  id: 'order-1',
  orderNumber: 'ORD-20250502-001',
  userId: 'user-1',
  status: 'CONFIRMED',
  subtotal: toDecimal(89990),
  discount: toDecimal(0),
  shippingCost: toDecimal(0),
  totalAmount: toDecimal(89990),
  paymentMethod: 'COD',
  paymentStatus: 'PAID',
  shippingAddress: { name: 'Test', phone: '123', address: 'Dhaka', city: 'Dhaka', area: 'Dhanmondi' },
  customerNote: null,
  couponCode: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      quantity: 1,
      unitPrice: toDecimal(89990),
      product: {
        id: 'prod-1',
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        images: ['s24-1.jpg'],
        brand: { name: 'Samsung' },
      },
    },
  ],
};

function createMockAuthService() {
  return {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    verifySession: vi.fn(),
    getUser: vi.fn(),
    refreshToken: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    socialLogin: vi.fn(),
    enable2FA: vi.fn(),
    verify2FA: vi.fn(),
    disable2FA: vi.fn(),
  };
}

function createMockPrisma() {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    productCategory: { findMany: vi.fn() },
    brand: { findMany: vi.fn() },
    user: { findUnique: vi.fn() },
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    coupon: { findFirst: vi.fn() },
  };
}

describe('Shop Integration Tests', () => {
  let app: INestApplication;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeAll(async () => {
    mockPrisma = createMockPrisma();
    mockAuthService = createMockAuthService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ],
      controllers: [ShopController],
      providers: [
        ShopService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MailService, useValue: { send: vi.fn() } },
        AuthGuard,
        RolesGuard,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseWrapperInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/shop/products', () => {
    it('should return paginated products', async () => {
      mockPrisma.$transaction.mockResolvedValue([[MOCK_PRODUCT_RAW], 1]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('total', 1);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('totalPages', 1);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].name).toBe('Samsung Galaxy S24');
      expect(res.body.data.data[0].sellingPrice).toBe(89990);
    });

    it('should accept search query parameter', async () => {
      mockPrisma.$transaction.mockResolvedValue([[MOCK_PRODUCT_RAW], 1]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/products?search=samsung')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });

    it('should accept pagination parameters', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/products?page=2&limit=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.limit).toBe(5);
    });

    it('should return empty list when no products match', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/products?search=nonexistent')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
    });
  });

  describe('GET /api/v1/shop/products/:slug', () => {
    it('should return a single product by slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(MOCK_PRODUCT_RAW);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/products/samsung-galaxy-s24')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('samsung-galaxy-s24');
      expect(res.body.data.name).toBe('Samsung Galaxy S24');
      expect(res.body.data.category.name).toBe('Smartphones');
      expect(res.body.data.brand.name).toBe('Samsung');
    });

    it('should return 404 for non-existent slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/products/non-existent-product')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });
  });

  describe('GET /api/v1/shop/categories', () => {
    it('should return categories with product count', async () => {
      mockPrisma.productCategory.findMany.mockResolvedValue([MOCK_CATEGORY]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual({
        id: 'cat-1',
        name: 'Smartphones',
        slug: 'smartphones',
        icon: 'phone',
        productCount: 5,
      });
    });
  });

  describe('GET /api/v1/shop/brands', () => {
    it('should return brands with product count', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([MOCK_BRAND]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/shop/brands')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual({
        id: 'brand-1',
        name: 'Samsung',
        slug: 'samsung',
        logo: 'samsung.png',
        productCount: 3,
      });
    });
  });

  describe('POST /api/v1/shop/orders', () => {
    const validOrder = {
      items: [{ productId: 'prod-1', quantity: 1 }],
      shippingAddress: {
        name: 'Test User',
        phone: '+8801700000000',
        address: '123 Street',
        city: 'Dhaka',
        area: 'Dhanmondi',
      },
      paymentMethod: 'COD',
    };

    it('should create an order with auth', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });

      const formattedOrder = {
        id: 'order-1',
        orderNumber: 'ORD-20250502-001',
        status: 'CONFIRMED',
        subtotal: 89990,
        discount: 0,
        shippingCost: 0,
        totalAmount: 89990,
        paymentMethod: 'COD',
        shippingAddress: MOCK_ORDER_RAW.shippingAddress,
        customerNote: null,
        createdAt: MOCK_ORDER_RAW.createdAt,
        updatedAt: MOCK_ORDER_RAW.updatedAt,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 1,
            unitPrice: 89990,
            product: {
              id: 'prod-1',
              name: 'Samsung Galaxy S24',
              slug: 'samsung-galaxy-s24',
              image: 's24-1.jpg',
              brand: 'Samsung',
            },
          },
        ],
      };
      mockPrisma.$transaction.mockResolvedValue(formattedOrder);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shop/orders')
        .set('Authorization', 'Bearer valid-token')
        .send(validOrder)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orderNumber', 'ORD-20250502-001');
      expect(res.body.data).toHaveProperty('status', 'CONFIRMED');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.totalAmount).toBe(89990);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/shop/orders')
        .send(validOrder)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Missing authentication token');
    });

    it('should return 400 for empty items array', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shop/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validOrder, items: [] })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid payment method', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shop/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validOrder, paymentMethod: 'BITCOIN' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing shipping address fields', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shop/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validOrder, shippingAddress: { name: 'Test' } })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
