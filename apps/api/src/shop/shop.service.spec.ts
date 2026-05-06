import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { ShopService } from './shop.service';

const mockPrisma = {
  user: { findUnique: vi.fn() },
  coupon: { findFirst: vi.fn(), update: vi.fn() },
  product: { findUnique: vi.fn(), update: vi.fn() },
  order: { create: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(),
};

describe('ShopService', () => {
  let service: ShopService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ShopService(mockPrisma as any);
  });

  // ── validateCoupon ────────────────────────────────────────────────

  describe('validateCoupon', () => {
    const baseCoupon = {
      id: 'c1',
      code: 'SAVE20',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: new Date('2099-12-31'),
      usageLimit: null,
      usedCount: 0,
      minOrderAmount: null,
      maxDiscount: null,
      discountType: 'PERCENTAGE' as const,
      discountValue: new Prisma.Decimal(20),
      description: '20% off',
    };

    it('returns correct discountAmount for PERCENTAGE type', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue(baseCoupon);

      const result = await service.validateCoupon('save20', 1000);

      expect(result.discountAmount).toBe(200);
      expect(result.discountType).toBe('PERCENTAGE');
    });

    it('returns correct discountAmount for FIXED type', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        discountType: 'FIXED',
        discountValue: new Prisma.Decimal(150),
      });

      const result = await service.validateCoupon('save20', 1000);

      expect(result.discountAmount).toBe(150);
    });

    it('caps PERCENTAGE discount at maxDiscount', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        discountValue: new Prisma.Decimal(50),
        maxDiscount: new Prisma.Decimal(100),
      });

      const result = await service.validateCoupon('save20', 1000);

      expect(result.discountAmount).toBe(100);
    });

    it('caps FIXED discount at orderTotal', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        discountType: 'FIXED',
        discountValue: new Prisma.Decimal(500),
      });

      const result = await service.validateCoupon('save20', 200);

      expect(result.discountAmount).toBe(200);
    });

    it('throws for invalid coupon code', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue(null);

      await expect(service.validateCoupon('BAD', 1000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws for inactive coupon', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        isActive: false,
      });

      await expect(service.validateCoupon('save20', 1000)).rejects.toThrow(
        'no longer active',
      );
    });

    it('throws for expired coupon', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        expiresAt: new Date('2020-01-01'),
      });

      await expect(service.validateCoupon('save20', 1000)).rejects.toThrow(
        'expired',
      );
    });

    it('throws when usage limit reached', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        usageLimit: 5,
        usedCount: 5,
      });

      await expect(service.validateCoupon('save20', 1000)).rejects.toThrow(
        'usage limit',
      );
    });

    it('throws when order total below minOrderAmount', async () => {
      mockPrisma.coupon.findFirst.mockResolvedValue({
        ...baseCoupon,
        minOrderAmount: new Prisma.Decimal(500),
      });

      await expect(service.validateCoupon('save20', 200)).rejects.toThrow(
        'Minimum order amount',
      );
    });
  });

  // ── createOrder ───────────────────────────────────────────────────

  describe('createOrder', () => {
    const userId = 'user-1';
    const shippingAddress = {
      name: 'Test',
      phone: '01700000000',
      address: '123 Main',
      city: 'Dhaka',
      area: 'Mirpur',
    };

    const product = {
      id: 'p1',
      name: 'Widget',
      slug: 'widget',
      sellingPrice: new Prisma.Decimal(500),
      stockQuantity: 10,
      images: ['img.jpg'],
      status: 'AVAILABLE',
      brand: { name: 'BrandX' },
    };

    const createdOrder = {
      id: 'ord-1',
      orderNumber: 'ORD-20260502-001',
      status: 'CONFIRMED',
      subtotal: new Prisma.Decimal(1000),
      discount: new Prisma.Decimal(0),
      shippingCost: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(1000),
      paymentMethod: 'COD',
      shippingAddress,
      customerNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'oi-1',
          productId: 'p1',
          quantity: 2,
          unitPrice: new Prisma.Decimal(500),
          product: {
            id: 'p1',
            name: 'Widget',
            slug: 'widget',
            images: ['img.jpg'],
            brand: { name: 'BrandX' },
          },
        },
      ],
    };

    function setupTxMock() {
      const txMock = {
        product: { findUnique: vi.fn(), update: vi.fn() },
        coupon: { findFirst: vi.fn(), update: vi.fn() },
        order: { create: vi.fn(), findFirst: vi.fn() },
      };

      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(txMock));
      return txMock;
    }

    it('rejects when email is not verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: false });

      await expect(
        service.createOrder(userId, {
          items: [{ productId: 'p1', quantity: 1 }],
          paymentMethod: 'COD' as any,
          shippingAddress,
        }),
      ).rejects.toThrow('verify your email');
    });

    it('rejects when stock is insufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });
      const txMock = setupTxMock();
      txMock.order.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue({
        ...product,
        stockQuantity: 0,
      });

      await expect(
        service.createOrder(userId, {
          items: [{ productId: 'p1', quantity: 2 }],
          paymentMethod: 'COD' as any,
          shippingAddress,
        }),
      ).rejects.toThrow('Insufficient stock');
    });

    it('sets paymentStatus=PAID and status=CONFIRMED for COD', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });
      const txMock = setupTxMock();
      txMock.order.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(product);
      txMock.order.create.mockResolvedValue(createdOrder);

      await service.createOrder(userId, {
        items: [{ productId: 'p1', quantity: 2 }],
        paymentMethod: 'COD' as any,
        shippingAddress,
      });

      const createCall = txMock.order.create.mock.calls[0][0];
      expect(createCall.data.paymentStatus).toBe('PAID');
      expect(createCall.data.status).toBe('CONFIRMED');
    });

    it('keeps paymentStatus PENDING for SSLCOMMERZ', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });
      const txMock = setupTxMock();
      txMock.order.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(product);
      txMock.order.create.mockResolvedValue({
        ...createdOrder,
        status: 'PENDING',
        paymentMethod: 'SSLCOMMERZ',
      });

      await service.createOrder(userId, {
        items: [{ productId: 'p1', quantity: 2 }],
        paymentMethod: 'SSLCOMMERZ' as any,
        shippingAddress,
      });

      const createCall = txMock.order.create.mock.calls[0][0];
      expect(createCall.data.paymentStatus).toBe('PENDING');
      expect(createCall.data.status).toBeUndefined();
    });

    it('applies coupon discount correctly', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });
      const txMock = setupTxMock();
      txMock.order.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(product);
      txMock.coupon.findFirst.mockResolvedValue({
        id: 'c1',
        code: 'SAVE10',
        isActive: true,
        startsAt: new Date('2020-01-01'),
        expiresAt: new Date('2099-12-31'),
        usageLimit: null,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscount: null,
        discountType: 'PERCENTAGE',
        discountValue: new Prisma.Decimal(10),
      });
      txMock.order.create.mockResolvedValue({
        ...createdOrder,
        discount: new Prisma.Decimal(100),
        totalAmount: new Prisma.Decimal(900),
        couponCode: 'SAVE10',
      });

      await service.createOrder(userId, {
        items: [{ productId: 'p1', quantity: 2 }],
        paymentMethod: 'COD' as any,
        shippingAddress,
        couponCode: 'save10',
      });

      const createCall = txMock.order.create.mock.calls[0][0];
      expect(createCall.data.couponCode).toBe('SAVE10');
      expect(createCall.data.discount.toNumber()).toBe(100);
      expect(createCall.data.totalAmount.toNumber()).toBe(900);
    });

    it('decrements stock after order', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });
      const txMock = setupTxMock();
      txMock.order.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(product);
      txMock.order.create.mockResolvedValue(createdOrder);

      await service.createOrder(userId, {
        items: [{ productId: 'p1', quantity: 3 }],
        paymentMethod: 'COD' as any,
        shippingAddress,
      });

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stockQuantity: 7, status: 'AVAILABLE' },
      });
    });
  });
});
