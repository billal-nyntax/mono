import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import type { PrismaService } from '@repo/database';
import { createApp, createTestUser, cleanDatabase } from '../helpers';

describe('Checkout E2E', () => {
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

  async function seedProducts() {
    const category = await prisma.productCategory.create({
      data: { name: 'Electronics', slug: 'electronics' },
    });

    const brand = await prisma.brand.create({
      data: { name: 'CouponBrand', slug: 'couponbrand' },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Expensive Gadget',
        slug: 'expensive-gadget',
        categoryId: category.id,
        brandId: brand.id,
        purchasePrice: 8000,
        sellingPrice: 10000,
        stockQuantity: 20,
        sku: 'EG-001',
        status: 'AVAILABLE',
      },
    });

    return { category, brand, product };
  }

  const shippingAddress = {
    name: 'Coupon Tester',
    phone: '01700000000',
    address: '456 Coupon Street',
    city: 'Dhaka',
    area: 'Dhanmondi',
  };

  describe('Coupon checkout flow', () => {
    it('should create a coupon via admin', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);

      const res = await request(server)
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .send({
          code: 'TESTCOUPON10',
          description: 'Test 10% off',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderAmount: 500,
          usageLimit: 2,
          isActive: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('TESTCOUPON10');
    });

    it('should validate coupon and return discount amount', async () => {
      const admin = await createTestUser(server, 'super_admin', prisma);
      const user = await createTestUser(server, 'user', prisma);

      await request(server)
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .send({
          code: 'VALIDATE10',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderAmount: 500,
          isActive: true,
        })
        .expect(201);

      const res = await request(server)
        .post('/api/v1/shop/coupons/validate')
        .set('Authorization', `Bearer ${user.tokens.accessToken}`)
        .send({ code: 'VALIDATE10', orderTotal: 5000 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.discountAmount).toBeDefined();
      expect(Number(res.body.data.discountAmount)).toBeGreaterThan(0);
    });

    it('should create order with coupon and apply discount', async () => {
      const { product } = await seedProducts();
      const admin = await createTestUser(server, 'super_admin', prisma);
      const user = await createTestUser(server, 'user', prisma);

      await request(server)
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .send({
          code: 'ORDERCOUPON',
          discountType: 'FIXED',
          discountValue: 1000,
          minOrderAmount: 500,
          usageLimit: 5,
          isActive: true,
        })
        .expect(201);

      const orderRes = await request(server)
        .post('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${user.tokens.accessToken}`)
        .send({
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress,
          paymentMethod: 'COD',
          couponCode: 'ORDERCOUPON',
        })
        .expect(201);

      expect(orderRes.body.success).toBe(true);
      expect(Number(orderRes.body.data.discount)).toBeGreaterThan(0);

      const coupon = await prisma.coupon.findUnique({
        where: { code: 'ORDERCOUPON' },
      });
      expect(coupon!.usedCount).toBe(1);
    });

    it('should reject coupon when usage limit is reached', async () => {
      const { product } = await seedProducts();
      const admin = await createTestUser(server, 'super_admin', prisma);

      await request(server)
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .send({
          code: 'LIMITCOUPON',
          discountType: 'FIXED',
          discountValue: 500,
          usageLimit: 1,
          isActive: true,
        })
        .expect(201);

      const user1 = await createTestUser(server, 'user', prisma);
      await request(server)
        .post('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${user1.tokens.accessToken}`)
        .send({
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress,
          paymentMethod: 'COD',
          couponCode: 'LIMITCOUPON',
        })
        .expect(201);

      const user2 = await createTestUser(server, 'user', prisma);
      const res = await request(server)
        .post('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${user2.tokens.accessToken}`)
        .send({
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress,
          paymentMethod: 'COD',
          couponCode: 'LIMITCOUPON',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid coupon code', async () => {
      const user = await createTestUser(server, 'user', prisma);

      const res = await request(server)
        .post('/api/v1/shop/coupons/validate')
        .set('Authorization', `Bearer ${user.tokens.accessToken}`)
        .send({ code: 'NONEXISTENT', orderTotal: 5000 });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});
