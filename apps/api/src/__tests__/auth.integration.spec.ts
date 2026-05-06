import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { PrismaService } from '@repo/database';
import { AuthService } from '@repo/auth-core';
import { MailService } from '@repo/mailer';
import { AuthController } from '../auth/auth.controller';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionRepository } from '../auth/repositories/session.repository';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/repositories/user.repository';
import { GlobalExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseWrapperInterceptor } from '../common/interceptors/response-wrapper.interceptor';

const TEST_USER = {
  email: 'test@example.com',
  password: 'StrongP@ss1',
  confirmPassword: 'StrongP@ss1',
  name: 'Test User',
  phone: '+8801700000000',
};

const MOCK_USER = {
  id: 'user-1',
  email: TEST_USER.email,
  name: TEST_USER.name,
  phone: TEST_USER.phone,
  role: 'user' as const,
  emailVerified: true,
  twoFactorEnabled: false,
  suspended: false,
  suspendedAt: null,
  suspendedReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
};

const MOCK_SESSION = {
  id: 'session-1',
  userId: 'user-1',
  token: MOCK_TOKENS.accessToken,
  expiresAt: new Date(Date.now() + 3600_000),
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
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
    verifyEmail: vi.fn(),
    resendVerificationEmail: vi.fn(),
  };
}

const noop = vi.fn();

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeAll(async () => {
    mockAuthService = createMockAuthService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ],
      controllers: [AuthController, UserController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MailService, useValue: { send: noop } },
        { provide: PrismaService, useValue: {} },
        { provide: SessionRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        UserService,
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

  describe('POST /api/v1/auth/signup', () => {
    it('should create a user and return tokens', async () => {
      mockAuthService.signUp.mockResolvedValue({
        success: true,
        user: MOCK_USER,
        tokens: MOCK_TOKENS,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(TEST_USER)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(TEST_USER.email);
      expect(res.body.data.tokens.accessToken).toBe(MOCK_TOKENS.accessToken);
      expect(res.body.data.tokens.refreshToken).toBe(MOCK_TOKENS.refreshToken);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: TEST_USER.email,
          name: TEST_USER.name,
        }),
      );
    });

    it('should return 400 for validation errors (missing fields)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ email: 'bad' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when passwords do not match', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...TEST_USER,
          confirmPassword: 'DifferentP@ss1',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 when auth service reports failure', async () => {
      mockAuthService.signUp.mockResolvedValue({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(TEST_USER)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Email already registered');
    });
  });

  describe('POST /api/v1/auth/signin', () => {
    it('should login and return tokens', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: true,
        user: MOCK_USER,
        tokens: MOCK_TOKENS,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(TEST_USER.email);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send({ email: TEST_USER.email, password: 'WrongP@ss1' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send({ password: TEST_USER.password })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return the current user with a valid token', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);

      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${MOCK_TOKENS.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(MOCK_USER.email);
      expect(res.body.data.name).toBe(MOCK_USER.name);
      expect(res.body.data.role).toBe('user');
    });

    it('should return 401 without a token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Missing authentication token');
    });

    it('should return 401 with an invalid/expired token', async () => {
      mockAuthService.verifySession.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer expired-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid or expired session');
    });
  });

  describe('POST /api/v1/auth/signout', () => {
    it('should sign out and return 204', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);
      mockAuthService.signOut.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/api/v1/auth/signout')
        .set('Authorization', `Bearer ${MOCK_TOKENS.accessToken}`)
        .expect(204);

      expect(mockAuthService.signOut).toHaveBeenCalledWith(MOCK_SESSION.id);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signout')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    const changePasswordDto = {
      currentPassword: 'StrongP@ss1',
      newPassword: 'NewStr0ng@Pass',
      confirmPassword: 'NewStr0ng@Pass',
    };

    it('should change password successfully', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);
      mockAuthService.changePassword.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${MOCK_TOKENS.accessToken}`)
        .send(changePasswordDto)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Password changed successfully');
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        MOCK_USER.id,
        expect.objectContaining({
          currentPassword: changePasswordDto.currentPassword,
          newPassword: changePasswordDto.newPassword,
        }),
      );
    });

    it('should return 401 without a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .send(changePasswordDto)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for weak new password', async () => {
      mockAuthService.verifySession.mockResolvedValue(MOCK_SESSION);
      mockAuthService.getUser.mockResolvedValue(MOCK_USER);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${MOCK_TOKENS.accessToken}`)
        .send({
          currentPassword: 'StrongP@ss1',
          newPassword: 'weak',
          confirmPassword: 'weak',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };
      mockAuthService.refreshToken.mockResolvedValue(newTokens);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'mock-refresh-token' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('new-access-token');
    });
  });

  describe('Response envelope format', () => {
    it('should wrap success responses in { success, data, error, timestamp }', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: true,
        user: MOCK_USER,
        tokens: MOCK_TOKENS,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error', null);
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
    });

    it('should wrap error responses in { success, data, error, statusCode, timestamp }', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('data', null);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});
