import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import type { User, UserWithPassword, UserId } from '@repo/auth-core';
import { createUserId } from '@repo/auth-core';
import type { User as PrismaUser } from '@repo/database';
import {
  UserRepository,
  type CreateUserData,
  type UpdateUserData,
} from './user.repository';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByIdWithPassword(id: UserId): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomainWithPassword(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomainWithPassword(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        phone: data.phone ?? null,
        role: data.role === 'admin'
          ? 'ADMIN'
          : data.role === 'super_admin'
            ? 'SUPER_ADMIN'
            : 'USER',
      },
    });
    return this.toDomain(user);
  }

  async update(id: UserId, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
        ...(data.twoFactorEnabled !== undefined && { twoFactorEnabled: data.twoFactorEnabled }),
        ...(data.twoFactorSecret !== undefined && { twoFactorSecret: data.twoFactorSecret }),
        ...(data.role !== undefined && {
          role: data.role === 'admin'
            ? 'ADMIN'
            : data.role === 'super_admin'
              ? 'SUPER_ADMIN'
              : 'USER',
        }),
        ...(data.suspended !== undefined && { suspended: data.suspended }),
        ...(data.suspendedAt !== undefined && { suspendedAt: data.suspendedAt }),
        ...(data.suspendedReason !== undefined && { suspendedReason: data.suspendedReason }),
      },
    });
    return this.toDomain(user);
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async countFiltered(search?: string): Promise<number> {
    const where = this.buildSearchWhere(search);
    return this.prisma.user.count({ where });
  }

  async findMany(params: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<User[]> {
    const where = this.buildSearchWhere(params.search);

    const users = await this.prisma.user.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toDomain(u));
  }

  private buildSearchWhere(search?: string) {
    if (!search) return undefined;
    return {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    };
  }

  private toDomain(raw: PrismaUser): User {
    return {
      id: createUserId(raw.id),
      email: raw.email,
      name: raw.name,
      phone: raw.phone,
      role: raw.role === 'ADMIN'
        ? 'admin'
        : raw.role === 'SUPER_ADMIN'
          ? 'super_admin'
          : 'user',
      emailVerified: raw.emailVerified,
      twoFactorEnabled: raw.twoFactorEnabled,
      suspended: raw.suspended,
      suspendedAt: raw.suspendedAt,
      suspendedReason: raw.suspendedReason,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private toDomainWithPassword(raw: PrismaUser): UserWithPassword {
    return {
      ...this.toDomain(raw),
      passwordHash: raw.passwordHash,
    };
  }
}
