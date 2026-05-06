import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async create(data: { name: string; slug: string; logo?: string }) {
    const existing = await this.prisma.brand.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException(`Brand "${data.slug}" already exists`);
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string; logo?: string }) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);

    if (data.slug && data.slug !== brand.slug) {
      const existing = await this.prisma.brand.findUnique({ where: { slug: data.slug } });
      if (existing) throw new ConflictException(`Slug "${data.slug}" already exists`);
    }

    return this.prisma.brand.update({ where: { id }, data });
  }

  async delete(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    if (brand._count.products > 0) {
      throw new ConflictException(`Cannot delete brand with ${String(brand._count.products)} products`);
    }
    await this.prisma.brand.delete({ where: { id } });
  }
}
