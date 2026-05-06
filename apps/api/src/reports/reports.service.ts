import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(period: 'today' | 'week' | 'month') {
    const startDate = this.getStartDate(period);

    const sales = await this.prisma.sale.findMany({
      where: { saleDate: { gte: startDate } },
      select: { totalAmount: true, totalProfit: true },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount.toNumber(), 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit.toNumber(), 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  async getBestSellers(period: 'today' | 'week' | 'month', limit: number = 10) {
    const startDate = this.getStartDate(period);

    const results = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { saleDate: { gte: startDate } } },
      _sum: { quantity: true, profit: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = results.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return results.map((r) => {
      const product = productMap.get(r.productId);
      const totalSold = r._sum.quantity ?? 0;
      const unitPrice = product?.sellingPrice.toNumber() ?? 0;
      return {
        productId: r.productId,
        productName: product?.name ?? 'Unknown',
        brand: product?.brand.name ?? 'Unknown',
        totalSold,
        totalRevenue: Math.round(unitPrice * totalSold * 100) / 100,
      };
    });
  }

  async getLowStock() {
    const settings = await this.prisma.shopSettings.findUnique({ where: { id: 'default' } });
    const threshold = settings?.lowStockThreshold ?? 3;

    return this.prisma.product.findMany({
      where: {
        OR: [
          { stockQuantity: { gt: 0, lte: threshold } },
          { stockQuantity: 0 },
        ],
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  async getProfitByProduct(period: 'today' | 'week' | 'month') {
    const startDate = this.getStartDate(period);

    const results = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { saleDate: { gte: startDate } } },
      _sum: { profit: true, quantity: true },
      _count: true,
      orderBy: { _sum: { profit: 'desc' } },
    });

    const productIds = results.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        brand: { select: { name: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return results.map((r) => {
      const product = productMap.get(r.productId);
      const unitsSold = r._sum.quantity ?? 0;
      const totalProfit = r._sum.profit?.toNumber() ?? 0;
      const purchasePrice = product?.purchasePrice.toNumber() ?? 0;
      const sellingPrice = product?.sellingPrice.toNumber() ?? 0;
      const totalRevenue = sellingPrice * unitsSold;
      const totalCost = purchasePrice * unitsSold;

      return {
        productId: r.productId,
        productName: product?.name ?? 'Unknown',
        brand: product?.brand.name ?? 'Unknown',
        unitsSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
      };
    });
  }

  private getStartDate(period: 'today' | 'week' | 'month'): Date {
    const now = new Date();
    switch (period) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff);
      }
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}
