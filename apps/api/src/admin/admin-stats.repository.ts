import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';

export interface DashboardStats {
  readonly totalProducts: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly todaySalesCount: number;
  readonly todayRevenue: number;
  readonly todayProfit: number;
  readonly totalRevenue: number;
}

@Injectable()
export class AdminStatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const settings = await this.prisma.shopSettings.findUnique({ where: { id: 'default' } });
    const lowStockThreshold = settings?.lowStockThreshold ?? 3;

    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      todaySales,
      allSales,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({
        where: {
          stockQuantity: { lte: lowStockThreshold },
          status: 'AVAILABLE',
        },
      }),
      this.prisma.product.count({
        where: { status: 'OUT_OF_STOCK' },
      }),
      this.prisma.sale.findMany({
        where: { saleDate: { gte: startOfDay } },
        select: { totalAmount: true, totalProfit: true },
      }),
      this.prisma.sale.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    const todaySalesCount = todaySales.length;
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount.toNumber(), 0);
    const todayProfit = todaySales.reduce((sum, s) => sum + s.totalProfit.toNumber(), 0);
    const totalRevenue = allSales._sum.totalAmount?.toNumber() ?? 0;

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      todaySalesCount,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      todayProfit: Math.round(todayProfit * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }
}
