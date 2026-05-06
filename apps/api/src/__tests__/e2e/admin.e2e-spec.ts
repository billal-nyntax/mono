import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import type { PrismaService } from '@repo/database';
import { createApp, createTestUser, cleanDatabase } from '../helpers';

describe('Admin E2E', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApp = await createApp();
    app = testApp.app;
    server = testApp.server;
    prisma = testApp.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  async function seedProductsAndOrder(adminToken: string, userToken: string) {
    const category = await prisma.productCategory.create({
      data: { name: 'Admin Test Cat', slug: 'admin-test-cat' },
    });

    const brand = await prisma.brand.create({
      data: { name: 'Admin Brand', slug: 'admin-brand' },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Admin Test Product',
        slug: 'admin-test-product',
        categoryId: category.id,
        brandId: brand.id,
        purchasePrice: 5000,
        sellingPrice: 8000,
        stockQuantity: 50,
        sku: 'ATP-001',
        status: 'AVAILABLE',
      },
    });

    const orderRes = await request(server)
      .post('/api/v1/shop/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: {
          name: 'Admin Test User',
          phone: '01700000000',
          address: '789 Admin St',
          city: 'Dhaka',
          area: 'Mirpur',
        },
        paymentMethod: 'COD',
      })
      .expect(201);

    return { product, orderId: orderRes.body.data.id };
  }

  describe('Admin order management', () => {
    it('should list orders as admin', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);
      const user = await createTestUser(server, 'user', prisma);
      await seedProductsAndOrder(
        admin.tokens.accessToken,
        user.tokens.accessToken,
      );

      const res = await request(server)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should update order status CONFIRMED → PROCESSING', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);
      const user = await createTestUser(server, 'user', prisma);
      const { orderId } = await seedProductsAndOrder(
        admin.tokens.accessToken,
        user.tokens.accessToken,
      );

      const res = await request(server)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .send({ status: 'PROCESSING' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PROCESSING');
    });

    it('should transition through full order lifecycle', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);
      const user = await createTestUser(server, 'user', prisma);
      const { orderId } = await seedProductsAndOrder(
        admin.tokens.accessToken,
        user.tokens.accessToken,
      );

      const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];

      for (const status of statuses) {
        const res = await request(server)
          .patch(`/api/v1/admin/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
          .send({ status })
          .expect(200);

        expect(res.body.data.status).toBe(status);
      }
    });

    it('should get dashboard stats as admin', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);

      const res = await request(server)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('Admin access control', () => {
    it('should return 403 for regular user accessing admin endpoints', async () => {
      const user = await createTestUser(server, 'user', prisma);

      await request(server)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${user.tokens.accessToken}`)
        .expect(403);
    });

    it('should return 403 for regular user updating order status', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);
      const user = await createTestUser(server, 'user', prisma);
      const { orderId } = await seedProductsAndOrder(
        admin.tokens.accessToken,
        user.tokens.accessToken,
      );

      await request(server)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${user.tokens.accessToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(403);
    });

    it('should return 401 for unauthenticated admin access', async () => {
      await request(server).get('/api/v1/admin/orders').expect(401);
    });

    it('should allow admin role to list orders', async () => {
      const admin = await createTestUser(server, 'admin', prisma);

      const res = await request(server)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should restrict super_admin-only endpoints from admin role', async () => {
      const admin = await createTestUser(server, 'admin', prisma);

      await request(server)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .expect(403);
    });
  });
});
