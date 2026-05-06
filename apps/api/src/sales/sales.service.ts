import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, Prisma } from '@repo/database';
import type { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async createSale(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoiceNumber = await this.generateInvoiceNumber(tx);

      let totalAmount = new Prisma.Decimal(0);
      let totalProfit = new Prisma.Decimal(0);

      const itemsData: {
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
        purchasePrice: Prisma.Decimal;
        profit: Prisma.Decimal;
      }[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          );
        }

        const itemTotal = product.sellingPrice.mul(item.quantity);
        const itemProfit = product.sellingPrice.sub(product.purchasePrice).mul(item.quantity);

        totalAmount = totalAmount.add(itemTotal);
        totalProfit = totalProfit.add(itemProfit);

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          profit: itemProfit,
        });

        const newQuantity = product.stockQuantity - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newQuantity,
            status: newQuantity === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
          },
        });
      }

      const subtotal = totalAmount;
      const discountAmount = new Prisma.Decimal(dto.discount ?? 0);

      // Discount cannot exceed subtotal
      const appliedDiscount = discountAmount.gt(subtotal) ? subtotal : discountAmount;
      const finalTotal = subtotal.sub(appliedDiscount);

      // Profit = revenue - cost. Discount reduces revenue, cost stays same.
      // totalProfit here = sum of (sellingPrice - purchasePrice) per item
      // adjustedProfit = totalProfit - discount (can be negative = loss)
      const adjustedProfit = totalProfit.sub(appliedDiscount);

      const paidAmount = dto.paidAmount !== undefined
        ? new Prisma.Decimal(dto.paidAmount)
        : finalTotal;
      const dueAmount = finalTotal.sub(paidAmount);
      const paymentStatus = dueAmount.lte(0) ? 'PAID' : paidAmount.gt(0) ? 'PARTIAL' : 'PENDING';

      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          subtotal,
          discount: appliedDiscount,
          totalAmount: finalTotal,
          totalProfit: adjustedProfit,
          paidAmount,
          dueAmount: dueAmount.lt(0) ? new Prisma.Decimal(0) : dueAmount,
          paymentMethod: dto.paymentMethod ?? 'CASH',
          paymentStatus,
          transactionId: dto.transactionId,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, brand: { select: { name: true } } },
              },
            },
          },
        },
      });

      return this.formatSale(sale);
    });
  }

  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, brand: { select: { name: true } } },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count(),
    ]);

    return {
      data: data.map((s) => this.formatSale(s)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, brand: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale ${id} not found`);
    }

    return this.formatSale(sale);
  }

  async findByInvoice(invoiceNumber: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { invoiceNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, brand: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with invoice ${invoiceNumber} not found`);
    }

    return this.formatSale(sale);
  }

  private async generateInvoiceNumber(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
  ): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INV-${dateStr}-`;

    const lastSale = await tx.sale.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let nextSeq = 1;
    if (lastSale) {
      const lastSeq = parseInt(lastSale.invoiceNumber.slice(-3), 10);
      nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;
    }

    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }

  private formatSale(sale: {
    id: string;
    invoiceNumber: string;
    customerName: string | null;
    customerPhone: string | null;
    subtotal: Prisma.Decimal;
    discount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    totalProfit: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    dueAmount: Prisma.Decimal;
    paymentMethod: string;
    paymentStatus: string;
    transactionId: string | null;
    saleDate: Date;
    createdAt: Date;
    items: {
      id: string;
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      purchasePrice: Prisma.Decimal;
      profit: Prisma.Decimal;
      product: { id: string; name: string; brand: { name: string } };
    }[];
  }) {
    return {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      subtotal: sale.subtotal.toNumber(),
      discount: sale.discount.toNumber(),
      totalAmount: sale.totalAmount.toNumber(),
      totalProfit: sale.totalProfit.toNumber(),
      paidAmount: sale.paidAmount.toNumber(),
      dueAmount: sale.dueAmount.toNumber(),
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      transactionId: sale.transactionId,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: {
          name: item.product.name,
          brand: item.product.brand.name,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        purchasePrice: item.purchasePrice.toNumber(),
        profit: item.profit.toNumber(),
      })),
    };
  }
}
