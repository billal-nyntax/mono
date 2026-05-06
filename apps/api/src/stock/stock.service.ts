import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockOverview(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { brand: { name: { contains: search, mode: 'insensitive' as const } } },
            { sku: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          brand: { select: { name: true } },
          sku: true,
          stockQuantity: true,
          status: true,
          category: { select: { name: true } },
          images: true,
        },
        skip,
        take: limit,
        orderBy: { stockQuantity: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addStock(productId: string, quantity: number, reason?: string, performedBy?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const newQuantity = product.stockQuantity + quantity;

    const [updatedProduct, movement] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          status: 'AVAILABLE',
        },
      }),
      this.prisma.stockMovement.create({
        data: {
          productId,
          type: 'IN',
          quantity,
          reason,
          performedBy,
        },
      }),
    ]);

    return {
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        stockQuantity: updatedProduct.stockQuantity,
        status: updatedProduct.status,
      },
      movement: {
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        createdAt: movement.createdAt,
      },
    };
  }

  async removeStock(productId: string, quantity: number, reason?: string, performedBy?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stockQuantity}, Requested: ${quantity}`,
      );
    }

    const newQuantity = product.stockQuantity - quantity;
    const newStatus = newQuantity === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE';

    const [updatedProduct, movement] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          status: newStatus as 'AVAILABLE' | 'OUT_OF_STOCK',
        },
      }),
      this.prisma.stockMovement.create({
        data: {
          productId,
          type: 'OUT',
          quantity,
          reason,
          performedBy,
        },
      }),
    ]);

    return {
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        stockQuantity: updatedProduct.stockQuantity,
        status: updatedProduct.status,
      },
      movement: {
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        createdAt: movement.createdAt,
      },
    };
  }

  async getHistory(productId: string, page: number, limit: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where: { productId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
