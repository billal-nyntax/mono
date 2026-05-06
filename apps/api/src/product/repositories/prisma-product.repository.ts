import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@repo/database';
import {
  ProductRepository,
  type ProductEntity,
  type ProductListResult,
  type ProductQueryParams,
  type CreateProductData,
  type UpdateProductData,
} from './product.repository';

const LOW_STOCK_THRESHOLD = 3;

const productInclude = {
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
} as const;

@Injectable()
export class PrismaProductRepository extends ProductRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(params: ProductQueryParams): Promise<ProductListResult> {
    const where = this.buildWhereClause(params);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map((p) => this.toDomain(p)),
      total,
    };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({ where: { id }, include: productInclude });
    return product ? this.toDomain(product) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productInclude });
    return product ? this.toDomain(product) : null;
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({ where: { sku }, include: productInclude });
    return product ? this.toDomain(product) : null;
  }

  async create(data: CreateProductData): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        brandId: data.brandId,
        model: data.model,
        description: data.description,
        purchasePrice: new Prisma.Decimal(data.purchasePrice),
        sellingPrice: new Prisma.Decimal(data.sellingPrice),
        stockQuantity: data.stockQuantity ?? 0,
        sku: data.sku,
        images: data.images ?? [],
        status: (data.stockQuantity ?? 0) > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
      },
      include: productInclude,
    });
    return this.toDomain(product);
  }

  async update(id: string, data: UpdateProductData): Promise<ProductEntity> {
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.brandId !== undefined) updateData.brand = { connect: { id: data.brandId } };
    if (data.model !== undefined) updateData.model = data.model;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = new Prisma.Decimal(data.purchasePrice);
    if (data.sellingPrice !== undefined) updateData.sellingPrice = new Prisma.Decimal(data.sellingPrice);
    if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.status !== undefined) updateData.status = data.status;

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });
    return this.toDomain(product);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async getBrands(): Promise<string[]> {
    const results = await this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    return results.map((r) => r.name);
  }

  private buildWhereClause(params: ProductQueryParams): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
        { brand: { name: { contains: params.search, mode: 'insensitive' } } },
        { category: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.brandId) {
      where.brandId = params.brandId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.lowStock) {
      where.stockQuantity = { lte: LOW_STOCK_THRESHOLD };
      where.status = 'AVAILABLE';
    }

    return where;
  }

  private toDomain(raw: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    category: { id: string; name: string };
    brandId: string;
    brand: { id: string; name: string };
    model: string | null;
    description: string | null;
    purchasePrice: Prisma.Decimal;
    sellingPrice: Prisma.Decimal;
    stockQuantity: number;
    sku: string | null;
    images: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      categoryId: raw.categoryId,
      category: raw.category.name,
      brandId: raw.brandId,
      brand: raw.brand.name,
      model: raw.model,
      description: raw.description,
      purchasePrice: raw.purchasePrice.toNumber(),
      sellingPrice: raw.sellingPrice.toNumber(),
      stockQuantity: raw.stockQuantity,
      sku: raw.sku,
      images: raw.images,
      status: raw.status as 'AVAILABLE' | 'OUT_OF_STOCK',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
