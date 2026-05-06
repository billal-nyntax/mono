import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { Server } from 'node:http';
import { PrismaService } from '@repo/database';
import { AppModule } from '../app.module';
import { GlobalExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseWrapperInterceptor } from '../common/interceptors/response-wrapper.interceptor';

const TEST_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/authapp_test';

export interface TestApp {
  app: INestApplication;
  server: Server;
  prisma: PrismaService;
}

export interface TestUser {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function createApp(): Promise<TestApp> {
  process.env['DATABASE_URL'] = TEST_DATABASE_URL;
  process.env['JWT_SECRET'] = 'test-jwt-secret-for-e2e';
  process.env['MAIL_PROVIDER'] = 'console';
  process.env['SMTP_HOST'] = '';
  process.env['PAYMENT_GATEWAY'] = 'sslcommerz';
  process.env['SSL_STORE_ID'] = 'test';
  process.env['SSL_STORE_PASS'] = 'test';
  process.env['SSL_SANDBOX'] = 'true';
  process.env['FRONTEND_URL'] = 'http://localhost:3000';
  process.env['NODE_ENV'] = 'test';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();

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

  const server = app.getHttpServer() as Server;
  const prisma = app.get(PrismaService);

  return { app, server, prisma };
}

let userCounter = 0;

export async function createTestUser(
  server: Server,
  role: 'user' | 'admin' | 'super_admin' = 'user',
  prisma?: PrismaService,
): Promise<TestUser> {
  userCounter++;
  const email = `testuser-${userCounter}-${Date.now()}@test.com`;
  const password = 'TestP@ss1';

  const signupRes = await request(server)
    .post('/api/v1/auth/signup')
    .send({
      email,
      password,
      confirmPassword: password,
      name: `Test User ${userCounter}`,
    })
    .expect(201);

  const { data } = signupRes.body;

  if (role !== 'user' && prisma) {
    await prisma.user.update({
      where: { id: data.user.id },
      data: {
        role: role === 'admin' ? 'ADMIN' : 'SUPER_ADMIN',
        emailVerified: true,
      },
    });
    data.user.role = role;
  }

  if (role === 'user' && prisma) {
    await prisma.user.update({
      where: { id: data.user.id },
      data: { emailVerified: true },
    });
  }

  return {
    user: data.user,
    tokens: data.tokens,
  };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations');

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${table}" CASCADE`,
    );
  }
}
