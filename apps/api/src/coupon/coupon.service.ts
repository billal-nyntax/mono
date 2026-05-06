import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@repo/database';
import type { CreateCouponDto } from './dto/create-coupon.dto';
import type { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} not found`);
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findById(id);

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.coupon.delete({ where: { id } });
  }

  async validateCoupon(code: string, orderTotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    const now = new Date();

    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException('This coupon is not yet valid');
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    const minOrder = coupon.minOrderAmount
      ? Number(coupon.minOrderAmount)
      : 0;

    if (orderTotal < minOrder) {
      throw new BadRequestException(
        `Minimum order amount of ${String(minOrder)} required to use this coupon`,
      );
    }

    const discountValue = Number(coupon.discountValue);
    const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;
    let discountAmount: number;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderTotal * discountValue) / 100;
      if (maxDiscount !== null && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = discountValue;
      if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
      }
    }

    return {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue,
        minOrderAmount: minOrder,
        maxDiscount,
      },
      discountAmount,
    };
  }

  async incrementUsage(code: string) {
    await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }
}
