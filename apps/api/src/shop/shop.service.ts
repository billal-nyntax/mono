import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, Prisma } from '@repo/database';
import type { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'sellingPrice' | 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.ProductWhereInput = {
      status: 'AVAILABLE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.sellingPrice = {};
      if (minPrice !== undefined) where.sellingPrice.gte = minPrice;
      if (maxPrice !== undefined) where.sellingPrice.lte = maxPrice;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'price' || sortBy === 'sellingPrice'
        ? { sellingPrice: sortOrder }
        : { [sortBy]: sortOrder };

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          sellingPrice: true,
          compareAtPrice: true,
          stockQuantity: true,
          images: true,
          status: true,
          model: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map((p) => this.formatProduct(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sellingPrice: true,
        compareAtPrice: true,
        stockQuantity: true,
        images: true,
        status: true,
        model: true,
        sku: true,
        specifications: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return this.formatProduct(product);
  }

  async getCategories() {
    const categories = await this.prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { status: 'AVAILABLE' } } } },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productCount: c._count.products,
    }));
  }

  async getBrands() {
    const brands = await this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { status: 'AVAILABLE' } } } },
      },
    });

    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      productCount: b._count.products,
    }));
  }

  async validateCoupon(code: string, orderTotal: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { code: { equals: code.toUpperCase(), mode: 'insensitive' } },
    });

    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (!coupon.isActive) throw new BadRequestException('This coupon is no longer active');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('This coupon has expired');
    if (coupon.startsAt > new Date()) throw new BadRequestException('This coupon is not yet active');
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('This coupon has reached its usage limit');
    if (coupon.minOrderAmount && new Prisma.Decimal(orderTotal).lt(coupon.minOrderAmount)) {
      throw new BadRequestException(`Minimum order amount is ৳${coupon.minOrderAmount.toNumber()}`);
    }

    let discountAmount: number;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderTotal * coupon.discountValue.toNumber()) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount.toNumber()) {
        discountAmount = coupon.maxDiscount.toNumber();
      }
    } else {
      discountAmount = Math.min(coupon.discountValue.toNumber(), orderTotal);
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toNumber(),
      discountAmount: Math.round(discountAmount * 100) / 100,
      description: coupon.description,
    };
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
    if (!user?.emailVerified) {
      throw new BadRequestException('Please verify your email address before placing an order');
    }

    return this.prisma.$transaction(async (tx) => {
      const orderNumber = await this.generateOrderNumber(tx);

      let subtotal = new Prisma.Decimal(0);

      const itemsData: {
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
      }[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          );
        }

        const itemTotal = product.sellingPrice.mul(item.quantity);
        subtotal = subtotal.add(itemTotal);

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
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

      let discount = new Prisma.Decimal(0);
      let couponCode: string | null = null;

      if (dto.couponCode) {
        const coupon = await tx.coupon.findFirst({
          where: { code: { equals: dto.couponCode.toUpperCase(), mode: 'insensitive' } },
        });

        if (!coupon) {
          throw new BadRequestException('Invalid coupon code');
        }
        if (!coupon.isActive) {
          throw new BadRequestException('This coupon is no longer active');
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new BadRequestException('This coupon has expired');
        }
        if (coupon.startsAt > new Date()) {
          throw new BadRequestException('This coupon is not yet active');
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new BadRequestException('This coupon has reached its usage limit');
        }
        if (coupon.minOrderAmount && subtotal.lt(coupon.minOrderAmount)) {
          throw new BadRequestException(
            `Minimum order amount for this coupon is ৳${coupon.minOrderAmount.toNumber()}`,
          );
        }

        if (coupon.discountType === 'PERCENTAGE') {
          discount = subtotal.mul(coupon.discountValue).div(100);
          if (coupon.maxDiscount && discount.gt(coupon.maxDiscount)) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
          if (discount.gt(subtotal)) {
            discount = subtotal;
          }
        }

        couponCode = coupon.code;
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const totalAmount = subtotal.sub(discount);

      const isCOD = dto.paymentMethod === 'COD';

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          discount,
          couponCode,
          totalAmount,
          paymentMethod: dto.paymentMethod,
          paymentStatus: isCOD ? 'PAID' : 'PENDING',
          status: isCOD ? 'CONFIRMED' : undefined,
          shippingAddress: dto.shippingAddress as unknown as Prisma.JsonObject,
          customerNote: dto.customerNote,
          items: { create: itemsData },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  brand: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      return this.formatOrder(order);
    });
  }

  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                brand: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.formatOrder(o));
  }

  private async generateOrderNumber(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
  ): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD-${dateStr}-`;

    const lastOrder = await tx.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });

    let nextSeq = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNumber.slice(-3), 10);
      nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;
    }

    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }

  private formatProduct(product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sellingPrice: Prisma.Decimal;
    compareAtPrice?: Prisma.Decimal | null;
    stockQuantity: number;
    images: string[];
    status: string;
    model: string | null;
    specifications?: unknown;
    createdAt: Date;
    category: { id: string; name: string; slug: string };
    brand: { id: string; name: string; slug: string };
    sku?: string | null;
    updatedAt?: Date;
  }) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sellingPrice: product.sellingPrice.toNumber(),
      compareAtPrice: product.compareAtPrice?.toNumber() ?? null,
      stockQuantity: product.stockQuantity,
      images: product.images,
      status: product.status,
      model: product.model,
      specifications: product.specifications as Record<string, string> | null,
      sku: product.sku,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category,
      brand: product.brand,
    };
  }

  private formatOrder(order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: Prisma.Decimal;
    discount: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    paymentMethod: string;
    shippingAddress: unknown;
    customerNote: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
        brand: { name: string };
      };
    }[];
  }) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      customerNote: order.customerNote,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0] ?? null,
          brand: item.product.brand.name,
        },
      })),
    };
  }
}
