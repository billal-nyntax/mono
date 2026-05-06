import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: any;
  let paymentGateway: any;
  let configService: any;

  beforeEach(() => {
    prisma = {
      order: { findUnique: vi.fn(), update: vi.fn().mockReturnValue('order-update-query') },
      payment: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn().mockReturnValue('payment-update-query'),
      },
      $transaction: vi.fn().mockResolvedValue([{}, {}]),
    };

    paymentGateway = {
      provider: 'sslcommerz',
      initiate: vi.fn(),
      verifyWebhook: vi.fn(),
      validatePayment: vi.fn(),
    };

    configService = {
      get: vi.fn((_key: string, defaultValue: string) => defaultValue),
    };

    service = new PaymentService(prisma, paymentGateway, configService);
  });

  describe('initiatePayment', () => {
    it('throws NotFoundException when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.initiatePayment('order-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when userId does not match', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'other-user',
        paymentStatus: 'PENDING',
      });

      await expect(service.initiatePayment('order-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when order is already paid', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        paymentStatus: 'PAID',
      });

      await expect(service.initiatePayment('order-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates Payment record and returns gatewayUrl on success', async () => {
      const order = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        userId: 'user-1',
        paymentStatus: 'PENDING',
        totalAmount: { toNumber: () => 1500 },
        shippingAddress: { name: 'John', phone: '017123', address: '123 St', city: 'Dhaka' },
        user: { name: 'John', email: 'john@test.com', phone: '017123' },
        items: [{ product: { name: 'Widget' } }],
      };

      prisma.order.findUnique.mockResolvedValue(order);
      paymentGateway.initiate.mockResolvedValue({
        sessionId: 'sess-1',
        gatewayUrl: 'https://pay.example.com/sess-1',
      });
      prisma.payment.create.mockResolvedValue({});

      const result = await service.initiatePayment('order-1', 'user-1');

      expect(result).toEqual({
        gatewayUrl: 'https://pay.example.com/sess-1',
        sessionId: 'sess-1',
      });
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order-1',
          gateway: 'sslcommerz',
          sessionId: 'sess-1',
          amount: order.totalAmount,
          currency: 'BDT',
          status: 'PENDING',
        }),
      });
    });
  });

  describe('handleWebhook', () => {
    it('updates payment and order when status is PAID', async () => {
      paymentGateway.verifyWebhook.mockReturnValue({
        sessionId: 'sess-1',
        orderId: 'order-1',
        status: 'PAID',
        transactionId: 'txn-123',
        raw: { foo: 'bar' },
      });

      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
      });

      await service.handleWebhook({ val_id: 'abc' });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'PAID', gatewayTxnId: 'txn-123' }),
        }),
      );
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: expect.objectContaining({ paymentStatus: 'PAID', status: 'CONFIRMED' }),
        }),
      );
    });

    it('updates payment and order when status is FAILED', async () => {
      paymentGateway.verifyWebhook.mockReturnValue({
        sessionId: 'sess-1',
        orderId: 'order-1',
        status: 'FAILED',
        transactionId: null,
        raw: { error: 'declined' },
      });

      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
      });

      await service.handleWebhook({ val_id: 'abc' });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: expect.objectContaining({ paymentStatus: 'FAILED' }),
        }),
      );
    });

    it('logs warning and returns when payment is unknown', async () => {
      paymentGateway.verifyWebhook.mockReturnValue({
        sessionId: null,
        orderId: 'unknown-order',
        status: 'PAID',
        transactionId: 'txn-1',
        raw: {},
      });

      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.payment.findFirst.mockResolvedValue(null);

      await service.handleWebhook({});

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('returns cached status when payment is already PAID', async () => {
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: 'PAID',
        gatewayTxnId: 'txn-123',
        gateway: 'sslcommerz',
        sessionId: 'sess-1',
      });

      const result = await service.verifyPayment('order-1');

      expect(result).toEqual({
        status: 'PAID',
        transactionId: 'txn-123',
        gateway: 'sslcommerz',
      });
      expect(paymentGateway.validatePayment).not.toHaveBeenCalled();
    });

    it('validates via gateway and updates on PAID', async () => {
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: 'PENDING',
        gatewayTxnId: null,
        gateway: 'sslcommerz',
        sessionId: 'sess-1',
      });

      paymentGateway.validatePayment.mockResolvedValue({
        status: 'PAID',
        transactionId: 'txn-456',
        raw: { validated: true },
      });

      const result = await service.verifyPayment('order-1');

      expect(result).toEqual({
        status: 'PAID',
        transactionId: 'txn-456',
        gateway: 'sslcommerz',
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'PAID', gatewayTxnId: 'txn-456' }),
        }),
      );
    });

    it('throws NotFoundException when no payment found', async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.verifyPayment('order-1')).rejects.toThrow(NotFoundException);
    });
  });
});
