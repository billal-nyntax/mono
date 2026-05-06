import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StockService } from './stock.service';

describe('StockService', () => {
  let service: StockService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    service = new StockService(prisma);
  });

  describe('addStock', () => {
    it('increases stockQuantity, sets status AVAILABLE, and creates movement record', async () => {
      const product = { id: 'prod-1', name: 'Widget', stockQuantity: 5 };
      prisma.product.findUnique.mockResolvedValue(product);

      const updatedProduct = {
        id: 'prod-1',
        name: 'Widget',
        stockQuantity: 15,
        status: 'AVAILABLE',
      };
      const movement = {
        id: 'mov-1',
        type: 'IN',
        quantity: 10,
        reason: 'restock',
        createdAt: new Date('2026-01-01'),
      };

      prisma.$transaction.mockResolvedValue([updatedProduct, movement]);

      const result = await service.addStock('prod-1', 10, 'restock', 'admin-1');

      expect(result.product.stockQuantity).toBe(15);
      expect(result.product.status).toBe('AVAILABLE');
      expect(result.movement.type).toBe('IN');
      expect(result.movement.quantity).toBe(10);
    });

    it('throws NotFoundException when product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.addStock('nonexistent', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeStock', () => {
    it('decreases stock and creates OUT movement', async () => {
      const product = { id: 'prod-1', name: 'Widget', stockQuantity: 10 };
      prisma.product.findUnique.mockResolvedValue(product);

      const updatedProduct = {
        id: 'prod-1',
        name: 'Widget',
        stockQuantity: 5,
        status: 'AVAILABLE',
      };
      const movement = {
        id: 'mov-2',
        type: 'OUT',
        quantity: 5,
        reason: 'sold',
        createdAt: new Date('2026-01-01'),
      };

      prisma.$transaction.mockResolvedValue([updatedProduct, movement]);

      const result = await service.removeStock('prod-1', 5, 'sold', 'admin-1');

      expect(result.product.stockQuantity).toBe(5);
      expect(result.movement.type).toBe('OUT');
      expect(result.movement.quantity).toBe(5);
    });

    it('throws BadRequestException when insufficient stock', async () => {
      const product = { id: 'prod-1', name: 'Widget', stockQuantity: 3 };
      prisma.product.findUnique.mockResolvedValue(product);

      await expect(service.removeStock('prod-1', 10)).rejects.toThrow(BadRequestException);
    });

    it('sets status OUT_OF_STOCK when quantity reaches zero', async () => {
      const product = { id: 'prod-1', name: 'Widget', stockQuantity: 5 };
      prisma.product.findUnique.mockResolvedValue(product);

      const updatedProduct = {
        id: 'prod-1',
        name: 'Widget',
        stockQuantity: 0,
        status: 'OUT_OF_STOCK',
      };
      const movement = {
        id: 'mov-3',
        type: 'OUT',
        quantity: 5,
        reason: 'sold',
        createdAt: new Date('2026-01-01'),
      };

      prisma.$transaction.mockResolvedValue([updatedProduct, movement]);

      const result = await service.removeStock('prod-1', 5, 'sold');

      expect(result.product.stockQuantity).toBe(0);
      expect(result.product.status).toBe('OUT_OF_STOCK');
    });
  });
});
