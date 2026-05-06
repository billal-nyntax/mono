import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import type { PrismaService } from '@repo/database';
import { createApp, createTestUser, cleanDatabase } from '../helpers';

describe('Shop E2E', () => {
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

  async function seedCatalog() {
    const category = await prisma.productCategory.create({
      data: { name: 'Smartphones', slug: 'smartphones', icon: 'Smartphone' },
    });

    const brand = await prisma.brand.create({
      data: { name: 'TestBrand', slug: 'testbrand' },
    });

    const product1 = await prisma.product.create({
      data: {
        name: 'Test Phone',
        slug: 'test-phone',
        categoryId: category.id,
        brandId: brand.id,
        purchasePrice: 50000,
        sellingPrice: 65000,
        stockQuantity: 10,
        sku: 'TP-001',
        status: 'AVAILABLE',
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: 'Test Tablet',
        slug: 'test-tablet',
        categoryId: category.id,
        brandId: brand.id,
        purchasePrice: 30000,
        sellingPrice: 45000,
        stockQuantity: 5,
        sku: 'TT-001',
        status: 'AVAILABLE',
      },
    });

    return { category, brand, product1, product2 };
  }

  describe('Product listing', () => {
    it('should list products with seeded data', async () => {
      await seedCatalog();

      const res = await request(server)
        .get('/api/v1/shop/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should get product by slug', async () => {
      await seedCatalog();

      const res = await request(server)
        .get('/api/v1/shop/products/test-phone')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Phone');
      expect(res.body.data.slug).toBe('test-phone');
    });

    it('should list categories', async () => {
      await seedCatalog();

      const res = await request(server)
        .get('/api/v1/shop/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Smartphones', slug: 'smartphones' }),
        ]),
      );
    });
  });

  describe('Order flow', () => {
    it('should create a COD order and decrease stock', async () => {
      const { product1 } = await seedCatalog();
      const { tokens } = await createTestUser(server, 'user', prisma);

      const res = await request(server)
        .post('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          items: [{ productId: product1.id, quantity: 2 }],
          shippingAddress: {
            name: 'Test User',
            phone: '01700000000',
            address: '123 Test Street',
            city: 'Dhaka',
            area: 'Gulshan',
          },
          paymentMethod: 'COD',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.status).toBe('CONFIRMED');

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product1.id },
      });
      expect(updatedProduct!.stockQuantity).toBe(8);
    });

    it('should reject order with insufficient stock', async () => {
      const { product2 } = await seedCatalog();
      const { tokens } = await createTestUser(server, 'user', prisma);

      const res = await request(server)
        .post('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          items: [{ productId: product2.id, quantity: 100 }],
          shippingAddress: {
            name: 'Test User',
            phone: '01700000000',
            address: '123 Test Street',
            city: 'Dhaka',
            area: 'Gulshan',
          },
          paymentMethod: 'COD',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should list user orders after creating one', async () => {
      const { product1 } = await seedCatalog();
      const { tokens } = await createTestUser(server, 'user', prisma);

      await request(server)
        .post('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          items: [{ productId: product1.id, quantity: 1 }],
          shippingAddress: {
            name: 'Test User',
            phone: '01700000000',
            address: '123 Test Street',
            city: 'Dhaka',
            area: 'Gulshan',
          },
          paymentMethod: 'COD',
        })
        .expect(201);

      const res = await request(server)
        .get('/api/v1/shop/orders')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].orderNumber).toBeDefined();
    });

    it('should require authentication for creating orders', async () => {
      const { product1 } = await seedCatalog();

      await request(server)
        .post('/api/v1/shop/orders')
        .send({
          items: [{ productId: product1.id, quantity: 1 }],
          shippingAddress: {
            name: 'Test User',
            phone: '01700000000',
            address: '123 Test Street',
            city: 'Dhaka',
            area: 'Gulshan',
          },
          paymentMethod: 'COD',
        })
        .expect(401);
    });
  });
});
