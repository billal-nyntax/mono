import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { SalesService } from './sales.service';

const mockPrisma = {
  sale: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  product: { findUnique: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
};

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SalesService(mockPrisma as any);
  });

  describe('createSale', () => {
    const productA = {
      id: 'p1',
      name: 'Widget',
      sellingPrice: new Prisma.Decimal(500),
      purchasePrice: new Prisma.Decimal(300),
      stockQuantity: 10,
      status: 'AVAILABLE',
      brand: { name: 'BrandX' },
    };

    const productB = {
      id: 'p2',
      name: 'Gadget',
      sellingPrice: new Prisma.Decimal(1000),
      purchasePrice: new Prisma.Decimal(700),
      stockQuantity: 5,
      status: 'AVAILABLE',
      brand: { name: 'BrandY' },
    };

    function setupTxMock() {
      const txMock = {
        product: { findUnique: vi.fn(), update: vi.fn() },
        sale: { create: vi.fn(), findFirst: vi.fn() },
      };

      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(txMock));
      return txMock;
    }

    function saleResult(overrides: Record<string, any> = {}) {
      return {
        id: 's1',
        invoiceNumber: 'INV-20260502-001',
        customerName: null,
        customerPhone: null,
        subtotal: new Prisma.Decimal(1000),
        discount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(1000),
        totalProfit: new Prisma.Decimal(400),
        paidAmount: new Prisma.Decimal(1000),
        dueAmount: new Prisma.Decimal(0),
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        transactionId: null,
        saleDate: new Date(),
        createdAt: new Date(),
        items: [
          {
            id: 'si1',
            productId: 'p1',
            quantity: 2,
            unitPrice: new Prisma.Decimal(500),
            purchasePrice: new Prisma.Decimal(300),
            profit: new Prisma.Decimal(400),
            product: { id: 'p1', name: 'Widget', brand: { name: 'BrandX' } },
          },
        ],
        ...overrides,
      };
    }

    it('calculates subtotal from items', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique
        .mockResolvedValueOnce(productA)
        .mockResolvedValueOnce(productB);
      txMock.sale.create.mockResolvedValue(
        saleResult({
          subtotal: new Prisma.Decimal(2000),
          totalAmount: new Prisma.Decimal(2000),
          paidAmount: new Prisma.Decimal(2000),
        }),
      );

      const result = await service.createSale({
        items: [
          { productId: 'p1', quantity: 2 },
          { productId: 'p2', quantity: 1 },
        ],
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      // 500*2 + 1000*1 = 2000
      expect(createCall.data.subtotal.toNumber()).toBe(2000);
      expect(result.subtotal).toBe(2000);
    });

    it('caps discount at subtotal', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(
        saleResult({
          subtotal: new Prisma.Decimal(500),
          discount: new Prisma.Decimal(500),
          totalAmount: new Prisma.Decimal(0),
          totalProfit: new Prisma.Decimal(-300),
          paidAmount: new Prisma.Decimal(0),
          dueAmount: new Prisma.Decimal(0),
        }),
      );

      await service.createSale({
        items: [{ productId: 'p1', quantity: 1 }],
        discount: 9999,
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      // discount capped at subtotal (500)
      expect(createCall.data.discount.toNumber()).toBe(500);
      expect(createCall.data.totalAmount.toNumber()).toBe(0);
    });

    it('calculates adjustedProfit = totalProfit - discount', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(saleResult());

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
        discount: 100,
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      // profit per unit = 500 - 300 = 200; total = 400
      // adjustedProfit = 400 - 100 = 300
      expect(createCall.data.totalProfit.toNumber()).toBe(300);
    });

    it('defaults paidAmount to finalTotal when not provided', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(saleResult());

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      // finalTotal = 1000, paidAmount should equal that
      expect(createCall.data.paidAmount.toNumber()).toBe(1000);
    });

    it('calculates dueAmount correctly', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(
        saleResult({
          paidAmount: new Prisma.Decimal(600),
          dueAmount: new Prisma.Decimal(400),
          paymentStatus: 'PARTIAL',
        }),
      );

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
        paidAmount: 600,
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      // finalTotal = 1000, paid = 600, due = 400
      expect(createCall.data.dueAmount.toNumber()).toBe(400);
    });

    it('sets paymentStatus to PAID when fully paid', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(saleResult());

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      expect(createCall.data.paymentStatus).toBe('PAID');
    });

    it('sets paymentStatus to PARTIAL when partially paid', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(saleResult({ paymentStatus: 'PARTIAL' }));

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
        paidAmount: 500,
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      expect(createCall.data.paymentStatus).toBe('PARTIAL');
    });

    it('sets paymentStatus to PENDING when nothing paid', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(saleResult({ paymentStatus: 'PENDING' }));

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
        paidAmount: 0,
      });

      const createCall = txMock.sale.create.mock.calls[0][0];
      expect(createCall.data.paymentStatus).toBe('PENDING');
    });

    it('decrements stock for each item', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue(productA);
      txMock.sale.create.mockResolvedValue(saleResult());

      await service.createSale({
        items: [{ productId: 'p1', quantity: 3 }],
      });

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stockQuantity: 7, status: 'AVAILABLE' },
      });
    });

    it('sets status to OUT_OF_STOCK when stock reaches 0', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue({
        ...productA,
        stockQuantity: 2,
      });
      txMock.sale.create.mockResolvedValue(saleResult());

      await service.createSale({
        items: [{ productId: 'p1', quantity: 2 }],
      });

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stockQuantity: 0, status: 'OUT_OF_STOCK' },
      });
    });

    it('throws for insufficient stock', async () => {
      const txMock = setupTxMock();
      txMock.sale.findFirst.mockResolvedValue(null);
      txMock.product.findUnique.mockResolvedValue({
        ...productA,
        stockQuantity: 1,
      });

      await expect(
        service.createSale({
          items: [{ productId: 'p1', quantity: 5 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
