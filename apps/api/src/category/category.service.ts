import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async create(data: { name: string; slug: string; icon?: string }) {
    const existing = await this.prisma.productCategory.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException(`Category "${data.slug}" already exists`);
    return this.prisma.productCategory.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string; icon?: string }) {
    const category = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.prisma.productCategory.findUnique({ where: { slug: data.slug } });
      if (existing) throw new ConflictException(`Slug "${data.slug}" already exists`);
    }

    return this.prisma.productCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    if (category._count.products > 0) {
      throw new ConflictException(`Cannot delete category with ${String(category._count.products)} products`);
    }
    await this.prisma.productCategory.delete({ where: { id } });
  }
}
