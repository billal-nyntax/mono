import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      sale: { findMany: vi.fn() },
      saleItem: { groupBy: vi.fn() },
      product: { findMany: vi.fn() },
      shopSettings: { findUnique: vi.fn() },
    };

    service = new ReportsService(prisma);
  });

  describe('getSummary', () => {
    it('computes totalSales, totalRevenue, totalProfit, averageOrderValue correctly', async () => {
      const sales = [
        { totalAmount: { toNumber: () => 1000 }, totalProfit: { toNumber: () => 200 } },
        { totalAmount: { toNumber: () => 2000 }, totalProfit: { toNumber: () => 500 } },
        { totalAmount: { toNumber: () => 1500 }, totalProfit: { toNumber: () => 300 } },
      ];

      prisma.sale.findMany.mockResolvedValue(sales);

      const result = await service.getSummary('month');

      expect(result.totalSales).toBe(3);
      expect(result.totalRevenue).toBe(4500);
      expect(result.totalProfit).toBe(1000);
      expect(result.averageOrderValue).toBe(1500);
    });

    it('returns zeros when no sales exist', async () => {
      prisma.sale.findMany.mockResolvedValue([]);

      const result = await service.getSummary('today');

      expect(result.totalSales).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalProfit).toBe(0);
      expect(result.averageOrderValue).toBe(0);
    });

    it('rounds revenue and profit to 2 decimal places', async () => {
      const sales = [
        { totalAmount: { toNumber: () => 33.333 }, totalProfit: { toNumber: () => 11.111 } },
        { totalAmount: { toNumber: () => 66.667 }, totalProfit: { toNumber: () => 22.222 } },
      ];

      prisma.sale.findMany.mockResolvedValue(sales);

      const result = await service.getSummary('week');

      expect(result.totalRevenue).toBe(100);
      expect(result.totalProfit).toBe(33.33);
      expect(result.averageOrderValue).toBe(50);
    });
  });
});
