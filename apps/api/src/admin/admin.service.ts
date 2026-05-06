import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService, Prisma } from '@repo/database';
import { AdminStatsRepository, type DashboardStats } from './admin-stats.repository';
import type { OrderStatusValue } from './dto/update-order-status.dto';

const ADMIN_STATUS_FLOW: Record<string, string> = {
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class AdminService {
  constructor(
    private readonly statsRepository: AdminStatsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    return this.statsRepository.getDashboardStats();
  }

  async listOrders(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: { select: { id: true } },
        },
      }),
      this.prisma.order.count(),
    ]);

    const data = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      user: order.user,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount.toNumber(),
      itemCount: order.items.length,
      createdAt: order.createdAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, brand: true } },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return {
      ...order,
      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
      })),
      payments: order.payments.map((p) => ({
        ...p,
        amount: p.amount.toNumber(),
      })),
    };
  }

  async updateOrderStatus(
    id: string,
    newStatus: OrderStatusValue,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const currentStatus = order.status;

    if (userRole === 'super_admin') {
      const allowed = VALID_TRANSITIONS[currentStatus];
      if (!allowed?.includes(newStatus)) {
        throw new BadRequestException(
          `Cannot transition from ${currentStatus} to ${newStatus}`,
        );
      }
    } else {
      const nextAllowed = ADMIN_STATUS_FLOW[currentStatus];
      if (!nextAllowed || nextAllowed !== newStatus) {
        throw new ForbiddenException(
          `Admin can only advance: CONFIRMED→PROCESSING→SHIPPED→DELIVERED. ` +
            `Cannot go from ${currentStatus} to ${newStatus}`,
        );
      }
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus as any },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  async listPayments(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
              paymentMethod: true,
              userId: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);

    const data = payments.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order.orderNumber,
      gateway: p.gateway,
      gatewayTxnId: p.gatewayTxnId,
      sessionId: p.sessionId,
      amount: p.amount.toNumber(),
      currency: p.currency,
      status: p.status,
      customerName: p.order.user.name,
      customerEmail: p.order.user.email,
      paymentMethod: p.order.paymentMethod,
      createdAt: p.createdAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPaymentStats() {
    const [totalCount, paidAggregate, statusCounts, gatewayCounts] =
      await Promise.all([
        this.prisma.payment.count(),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'PAID' },
        }),
        this.prisma.payment.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.payment.groupBy({
          by: ['gateway'],
          _count: { id: true },
        }),
      ]);

    const byStatus: Record<string, number> = {};
    for (const s of statusCounts) {
      byStatus[s.status] = s._count.id;
    }

    const byGateway: Record<string, number> = {};
    for (const g of gatewayCounts) {
      byGateway[g.gateway] = g._count.id;
    }

    return {
      totalPayments: totalCount,
      totalPaidAmount: paidAggregate._sum.amount
        ? new Prisma.Decimal(paidAggregate._sum.amount).toNumber()
        : 0,
      byStatus: {
        PENDING: byStatus['PENDING'] ?? 0,
        PAID: byStatus['PAID'] ?? 0,
        FAILED: byStatus['FAILED'] ?? 0,
      },
      byGateway,
    };
  }
}
