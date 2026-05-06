import { BadRequestException } from '@nestjs/common';
import { CouponService } from './coupon.service';

const mockPrisma = {
  coupon: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CouponService(mockPrisma as any);
  });

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
      discountValue: 20, // stored as Decimal in DB, Number() is called in service
    };

    it('calculates PERCENTAGE discount with maxDiscount cap', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        discountValue: 50,
        maxDiscount: 200,
      });

      const result = await service.validateCoupon('SAVE20', 1000);

      // 50% of 1000 = 500, capped at 200
      expect(result.discountAmount).toBe(200);
      expect(result.coupon.discountType).toBe('PERCENTAGE');
    });

    it('calculates PERCENTAGE discount without cap when maxDiscount is null', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(baseCoupon);

      const result = await service.validateCoupon('save20', 1000);

      expect(result.discountAmount).toBe(200);
    });

    it('calculates FIXED discount capped by orderTotal', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        discountType: 'FIXED',
        discountValue: 500,
      });

      const result = await service.validateCoupon('SAVE20', 300);

      expect(result.discountAmount).toBe(300);
    });

    it('returns full FIXED discount when it is less than orderTotal', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        discountType: 'FIXED',
        discountValue: 100,
      });

      const result = await service.validateCoupon('SAVE20', 500);

      expect(result.discountAmount).toBe(100);
    });

    it('throws for inactive coupon', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        isActive: false,
      });

      await expect(service.validateCoupon('SAVE20', 1000)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCoupon('SAVE20', 1000)).rejects.toThrow(
        'no longer active',
      );
    });

    it('throws for expired coupon', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        expiresAt: new Date('2020-06-01'),
      });

      await expect(service.validateCoupon('SAVE20', 1000)).rejects.toThrow(
        'expired',
      );
    });

    it('throws when usage limit exceeded', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        usageLimit: 10,
        usedCount: 10,
      });

      await expect(service.validateCoupon('SAVE20', 1000)).rejects.toThrow(
        'usage limit',
      );
    });

    it('throws when minOrderAmount not met', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        ...baseCoupon,
        minOrderAmount: 500,
      });

      await expect(service.validateCoupon('SAVE20', 200)).rejects.toThrow(
        'Minimum order amount',
      );
    });

    it('throws when coupon not found', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(null);

      await expect(service.validateCoupon('NOPE', 1000)).rejects.toThrow(
        'Coupon not found',
      );
    });
  });
});
