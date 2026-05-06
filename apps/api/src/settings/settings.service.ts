import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import type { UpdateSettingsDto } from './settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.shopSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        shopName: 'My Shop',
        currency: 'BDT',
        currencySymbol: '৳',
        lowStockThreshold: 3,
      },
    });

    return {
      id: settings.id,
      shopName: settings.shopName,
      shopLogo: settings.shopLogo,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      lowStockThreshold: settings.lowStockThreshold,
      updatedAt: settings.updatedAt,
    };
  }

  async update(dto: UpdateSettingsDto) {
    const data: Record<string, unknown> = {};
    if (dto.shopName !== undefined) data.shopName = dto.shopName;
    if (dto.shopLogo !== undefined) data.shopLogo = dto.shopLogo;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.currencySymbol !== undefined) data.currencySymbol = dto.currencySymbol;
    if (dto.lowStockThreshold !== undefined) data.lowStockThreshold = dto.lowStockThreshold;

    const settings = await this.prisma.shopSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        id: 'default',
        shopName: dto.shopName ?? 'My Shop',
        shopLogo: dto.shopLogo,
        currency: dto.currency ?? 'BDT',
        currencySymbol: dto.currencySymbol ?? '৳',
        lowStockThreshold: dto.lowStockThreshold ?? 3,
      },
    });

    return {
      id: settings.id,
      shopName: settings.shopName,
      shopLogo: settings.shopLogo,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      lowStockThreshold: settings.lowStockThreshold,
      updatedAt: settings.updatedAt,
    };
  }
}
