import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;
  let statsRepository: any;

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      payment: {
        findMany: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
      },
    };

    statsRepository = {
      getDashboardStats: vi.fn(),
    };

    service = new AdminService(statsRepository, prisma);
  });

  describe('updateOrderStatus', () => {
    it('throws NotFoundException when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('order-1', 'CONFIRMED', 'super_admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('super_admin can transition PENDING → CONFIRMED', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PENDING' });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'CONFIRMED',
        updatedAt: new Date(),
        user: { id: 'u1', name: 'John', email: 'j@test.com' },
      });

      const result = await service.updateOrderStatus('order-1', 'CONFIRMED', 'super_admin');

      expect(result.status).toBe('CONFIRMED');
    });

    it('super_admin can CANCEL an order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PENDING' });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'CANCELLED',
        updatedAt: new Date(),
        user: { id: 'u1', name: 'John', email: 'j@test.com' },
      });

      const result = await service.updateOrderStatus('order-1', 'CANCELLED', 'super_admin');

      expect(result.status).toBe('CANCELLED');
    });

    it('super_admin cannot make invalid transition (DELIVERED → CANCELLED)', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'DELIVERED' });

      await expect(
        service.updateOrderStatus('order-1', 'CANCELLED', 'super_admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('admin can advance CONFIRMED → PROCESSING', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'PROCESSING',
        updatedAt: new Date(),
        user: { id: 'u1', name: 'John', email: 'j@test.com' },
      });

      const result = await service.updateOrderStatus('order-1', 'PROCESSING', 'admin');

      expect(result.status).toBe('PROCESSING');
    });

    it('admin can advance PROCESSING → SHIPPED', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PROCESSING' });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'SHIPPED',
        updatedAt: new Date(),
        user: { id: 'u1', name: 'John', email: 'j@test.com' },
      });

      const result = await service.updateOrderStatus('order-1', 'SHIPPED', 'admin');

      expect(result.status).toBe('SHIPPED');
    });

    it('admin can advance SHIPPED → DELIVERED', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'SHIPPED' });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'DELIVERED',
        updatedAt: new Date(),
        user: { id: 'u1', name: 'John', email: 'j@test.com' },
      });

      const result = await service.updateOrderStatus('order-1', 'DELIVERED', 'admin');

      expect(result.status).toBe('DELIVERED');
    });

    it('admin cannot cancel an order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });

      await expect(
        service.updateOrderStatus('order-1', 'CANCELLED', 'admin'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('admin cannot skip steps (CONFIRMED → SHIPPED)', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });

      await expect(
        service.updateOrderStatus('order-1', 'SHIPPED', 'admin'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
