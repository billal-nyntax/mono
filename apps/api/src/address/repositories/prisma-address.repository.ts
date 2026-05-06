import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import type { Address, AddressId, UserId } from '@repo/auth-core';
import { createAddressId } from '@repo/auth-core';
import type { Address as PrismaAddress } from '@repo/database';
import {
  AddressRepository,
  type CreateAddressData,
  type UpdateAddressData,
} from './address.repository';

@Injectable()
export class PrismaAddressRepository extends AddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: AddressId): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({ where: { id } });
    return address ? this.toDomain(address) : null;
  }

  async findByUserId(userId: UserId): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses.map((a) => this.toDomain(a));
  }

  async create(data: CreateAddressData): Promise<Address> {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId: data.userId,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault ?? false,
      },
    });
    return this.toDomain(address);
  }

  async update(id: AddressId, data: UpdateAddressData): Promise<Address> {
    const address = await this.prisma.address.update({
      where: { id },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.street !== undefined && { street: data.street }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
    return this.toDomain(address);
  }

  async delete(id: AddressId): Promise<void> {
    await this.prisma.address.delete({ where: { id } });
  }

  async setDefault(id: AddressId, userId: UserId): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);
  }

  private toDomain(raw: PrismaAddress): Address {
    return {
      id: createAddressId(raw.id),
      userId: raw.userId as UserId,
      label: raw.label,
      street: raw.street,
      city: raw.city,
      state: raw.state,
      postalCode: raw.postalCode,
      country: raw.country,
      isDefault: raw.isDefault,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
