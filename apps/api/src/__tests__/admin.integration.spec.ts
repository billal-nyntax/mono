import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { PrismaService } from '@repo/database';
import { AuthService } from '@repo/auth-core';
import { MailService } from '@repo/mailer';
import { AdminController } from '../admin/admin.controller';
import { AdminService } from '../admin/admin.service';
import { AdminStatsRepository } from '../admin/admin-stats.repository';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/repositories/user.repository';
import { AddressService } from '../address/address.service';
import { AddressRepository } from '../address/repositories/address.repository';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GlobalExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseWrapperInterceptor } from '../common/interceptors/response-wrapper.interceptor';

function toDecimal(n: number) {
  return {
    toNumber: () => n,
    mul: (x: number) => toDecimal(n * x),
  };
}

const MOCK_ADMIN = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  phone: null,
  role: 'admin' as const,
  emailVerified: true,
  twoFactorEnabled: false,
  suspended: false,
  suspendedAt: null,
  suspendedReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_SUPER_ADMIN = {
  ...MOCK_ADMIN,
  id: 'super-admin-1',
  email: 'superadmin@example.com',
  name: 'Super Admin',
  role: 'super_admin' as const,
};

const MOCK_REGULAR_USER = {
  ...MOCK_ADMIN,
  id: 'user-1',
  email: 'user@example.com',
  name: 'Regular User',
  role: 'user' as const,
};

const ADMIN_SESSION = {
  id: 'session-admin',
  userId: 'admin-1',
  token: 'admin-token',
  expiresAt: new Date(Date.now() + 3600_000),
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
};

const SUPER_ADMIN_SESSION = {
  id: 'session-super-admin',
  userId: 'super-admin-1',
  token: 'super-admin-token',
  expiresAt: new Date(Date.now() + 3600_000),
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
};

const USER_SESSION = {
  id: 'session-user',
  userId: 'user-1',
  token: 'user-token',
  expiresAt: new Date(Date.now() + 3600_000),
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
};

const MOCK_ORDER_LIST_RAW = {
  id: 'order-1',
  orderNumber: 'ORD-20250502-001',
  status: 'CONFIRMED',
  paymentMethod: 'COD',
  paymentStatus: 'PAID',
  totalAmount: toDecimal(89990),
  createdAt: new Date(),
  user: { name: 'Customer', email: 'customer@test.com', phone: '+880170000' },
  items: [{ id: 'item-1' }],
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
    product: { count: vi.fn() },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    shopSettings: { findUnique: vi.fn() },
    sale: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    payment: {
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  };
}

describe('Admin Integration Tests', () => {
  let app: INestApplication;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  function authenticateAsAdmin() {
    mockAuthService.verifySession.mockResolvedValue(ADMIN_SESSION);
    mockAuthService.getUser.mockResolvedValue(MOCK_ADMIN);
  }

  function authenticateAsSuperAdmin() {
    mockAuthService.verifySession.mockResolvedValue(SUPER_ADMIN_SESSION);
    mockAuthService.getUser.mockResolvedValue(MOCK_SUPER_ADMIN);
  }

  function authenticateAsUser() {
    mockAuthService.verifySession.mockResolvedValue(USER_SESSION);
    mockAuthService.getUser.mockResolvedValue(MOCK_REGULAR_USER);
  }

  beforeAll(async () => {
    mockPrisma = createMockPrisma();
    mockAuthService = createMockAuthService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ],
      controllers: [AdminController],
      providers: [
        AdminService,
        AdminStatsRepository,
        UserService,
        AddressService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MailService, useValue: { send: vi.fn() } },
        { provide: UserRepository, useValue: {} },
        { provide: AddressRepository, useValue: {} },
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

  describe('GET /api/v1/admin/dashboard', () => {
    it('should return dashboard stats for admin', async () => {
      authenticateAsAdmin();
      mockPrisma.shopSettings.findUnique.mockResolvedValue({ id: 'default', lowStockThreshold: 3 });
      mockPrisma.product.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);
      mockPrisma.sale.findMany.mockResolvedValue([
        { totalAmount: toDecimal(150000), totalProfit: toDecimal(30000) },
      ]);
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: toDecimal(5000000) },
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalProducts');
      expect(res.body.data).toHaveProperty('lowStockCount');
      expect(res.body.data).toHaveProperty('outOfStockCount');
      expect(res.body.data).toHaveProperty('todaySalesCount');
      expect(res.body.data).toHaveProperty('todayRevenue');
      expect(res.body.data).toHaveProperty('totalRevenue');
    });

    it('should return dashboard stats for super_admin', async () => {
      authenticateAsSuperAdmin();
      mockPrisma.shopSettings.findUnique.mockResolvedValue(null);
      mockPrisma.product.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);
      mockPrisma.sale.findMany.mockResolvedValue([]);
      mockPrisma.sale.aggregate.mockResolvedValue({ _sum: { totalAmount: null } });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer super-admin-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProducts).toBe(50);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 for non-admin user', async () => {
      authenticateAsUser();

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Requires one of roles');
    });
  });

  describe('GET /api/v1/admin/orders', () => {
    it('should return paginated orders for admin', async () => {
      authenticateAsAdmin();
      mockPrisma.order.findMany.mockResolvedValue([MOCK_ORDER_LIST_RAW]);
      mockPrisma.order.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('total', 1);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('totalPages', 1);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].orderNumber).toBe('ORD-20250502-001');
    });

    it('should accept pagination parameters', async () => {
      authenticateAsAdmin();
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/orders?page=2&limit=5')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.limit).toBe(5);
    });

    it('should return 403 for non-admin user', async () => {
      authenticateAsUser();

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/admin/orders/:id/status', () => {
    it('should update order status as super_admin', async () => {
      authenticateAsSuperAdmin();
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
      });
      mockPrisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-20250502-001',
        status: 'CONFIRMED',
        updatedAt: new Date(),
        user: { id: 'user-1', name: 'Customer', email: 'c@test.com' },
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-1/status')
        .set('Authorization', 'Bearer super-admin-token')
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.orderNumber).toBe('ORD-20250502-001');
    });

    it('should update order status as admin (forward only)', async () => {
      authenticateAsAdmin();
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'CONFIRMED',
      });
      mockPrisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-20250502-001',
        status: 'PROCESSING',
        updatedAt: new Date(),
        user: { id: 'user-1', name: 'Customer', email: 'c@test.com' },
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-1/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'PROCESSING' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PROCESSING');
    });

    it('should return 400 for invalid status transition (super_admin)', async () => {
      authenticateAsSuperAdmin();
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'DELIVERED',
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-1/status')
        .set('Authorization', 'Bearer super-admin-token')
        .send({ status: 'PENDING' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot transition');
    });

    it('should return 403 when admin tries invalid forward', async () => {
      authenticateAsAdmin();
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'CONFIRMED',
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-1/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'DELIVERED' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Admin can only advance');
    });

    it('should return 404 for non-existent order', async () => {
      authenticateAsSuperAdmin();
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/non-existent/status')
        .set('Authorization', 'Bearer super-admin-token')
        .send({ status: 'CONFIRMED' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });

    it('should return 400 for invalid status value', async () => {
      authenticateAsSuperAdmin();

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-1/status')
        .set('Authorization', 'Bearer super-admin-token')
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 for non-admin user', async () => {
      authenticateAsUser();

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-1/status')
        .set('Authorization', 'Bearer user-token')
        .send({ status: 'CONFIRMED' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-based access control', () => {
    it('should allow admin to access admin endpoints', async () => {
      authenticateAsAdmin();
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
    });

    it('should allow super_admin to access admin endpoints', async () => {
      authenticateAsSuperAdmin();
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', 'Bearer super-admin-token')
        .expect(200);
    });

    it('should reject regular user from admin endpoints', async () => {
      authenticateAsUser();

      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('should reject unauthenticated requests to admin endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .expect(401);

      await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/some-id/status')
        .send({ status: 'CONFIRMED' })
        .expect(401);
    });
  });
});
