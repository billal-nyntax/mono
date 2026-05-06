import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Prisma } from '@repo/database';
import { PaymentGateway } from '@repo/payment';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentGateway: PaymentGateway,
    private readonly configService: ConfigService,
  ) {}

  async initiatePayment(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new NotFoundException('Order not found');
    if (order.paymentStatus !== 'PENDING') {
      throw new BadRequestException(`Order payment status is already ${order.paymentStatus}`);
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const apiBaseUrl = this.configService.get<string>('API_BASE_URL', 'http://localhost:4000');

    const productName = order.items.map((i) => i.product.name).join(', ').slice(0, 200) || 'Product';
    const addr = order.shippingAddress as Record<string, string>;

    const result = await this.paymentGateway.initiate({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount.toNumber(),
      currency: 'BDT',
      customerName: addr['name'] ?? order.user.name ?? 'Customer',
      customerEmail: order.user.email || 'customer@example.com',
      customerPhone: addr['phone'] ?? order.user.phone ?? '01700000000',
      customerAddress: addr['address'] ?? 'N/A',
      customerCity: addr['city'] ?? 'Dhaka',
      productName,
      successUrl: `${frontendUrl}/checkout/payment-result?status=success&order=${order.orderNumber}`,
      failUrl: `${frontendUrl}/checkout/payment-result?status=fail&order=${order.orderNumber}`,
      cancelUrl: `${frontendUrl}/checkout/payment-result?status=cancel&order=${order.orderNumber}`,
      webhookUrl: `${apiBaseUrl}/api/v1/payment/webhook`,
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: this.paymentGateway.provider,
        sessionId: result.sessionId,
        amount: order.totalAmount,
        currency: 'BDT',
        status: 'PENDING',
      },
    });

    return { gatewayUrl: result.gatewayUrl, sessionId: result.sessionId };
  }

  async handleWebhook(payload: Record<string, unknown>) {
    const parsed = this.paymentGateway.verifyWebhook(payload);

    let payment = parsed.sessionId
      ? await this.prisma.payment.findUnique({ where: { sessionId: parsed.sessionId } })
      : null;

    if (!payment) {
      payment = await this.prisma.payment.findFirst({
        where: { orderId: parsed.orderId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!payment) {
      this.logger.warn(`Webhook for unknown payment: orderId=${parsed.orderId}`);
      return;
    }

    const rawJson = parsed.raw as unknown as Prisma.InputJsonValue;

    if (parsed.status === 'PAID') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', gatewayTxnId: parsed.transactionId, rawResponse: rawJson },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'PAID', transactionId: parsed.transactionId, status: 'CONFIRMED' },
        }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', rawResponse: rawJson },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'FAILED' },
        }),
      ]);
    }
  }

  async verifyPayment(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) throw new NotFoundException('No payment found for this order');

    if (payment.status === 'PAID') {
      return { status: payment.status, transactionId: payment.gatewayTxnId, gateway: payment.gateway };
    }

    if (!payment.sessionId) {
      return { status: payment.status, transactionId: null, gateway: payment.gateway };
    }

    const result = await this.paymentGateway.validatePayment(payment.sessionId);
    const rawJson = result.raw as unknown as Prisma.InputJsonValue;

    if (result.status === 'PAID') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', gatewayTxnId: result.transactionId, rawResponse: rawJson },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'PAID', transactionId: result.transactionId, status: 'CONFIRMED' },
        }),
      ]);
    } else if (result.status === 'FAILED') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', rawResponse: rawJson },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'FAILED' },
        }),
      ]);
    }

    return { status: result.status, transactionId: result.transactionId, gateway: payment.gateway };
  }
}
