import type { User, UserWithPassword, UserId } from '@repo/auth-core';
import { createUserId } from '@repo/auth-core';
import {
  UserRepository,
  type CreateUserData,
  type UpdateUserData,
} from './user.repository';

export class InMemoryUserRepository extends UserRepository {
  private readonly users: Map<string, UserWithPassword> = new Map();

  async findById(id: UserId): Promise<User | null> {
    const user = this.users.get(id);
    return user ? this.stripPassword(user) : null;
  }

  async findByIdWithPassword(id: UserId): Promise<UserWithPassword | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.findByEmailSync(email);
    return user ? this.stripPassword(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    return this.findByEmailSync(email) ?? null;
  }

  async create(data: CreateUserData): Promise<User> {
    const id = createUserId(`user_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    const now = new Date();
    const user: UserWithPassword = {
      id,
      email: data.email,
      name: data.name,
      phone: data.phone ?? null,
      passwordHash: data.passwordHash,
      role: data.role ?? 'user',
      emailVerified: false,
      twoFactorEnabled: false,
      suspended: false,
      suspendedAt: null,
      suspendedReason: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return this.stripPassword(user);
  }

  async update(id: UserId, data: UpdateUserData): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error(`User ${id} not found`);

    const updated: UserWithPassword = {
      ...existing,
      ...(data.email !== undefined && { email: data.email }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
      ...(data.twoFactorEnabled !== undefined && { twoFactorEnabled: data.twoFactorEnabled }),
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return this.stripPassword(updated);
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async countFiltered(search?: string): Promise<number> {
    if (!search) return this.users.size;
    const lowerSearch = search.toLowerCase();
    return Array.from(this.users.values()).filter(
      (u) =>
        u.email.toLowerCase().includes(lowerSearch) ||
        u.name.toLowerCase().includes(lowerSearch),
    ).length;
  }

  async findMany(params: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<User[]> {
    let users = Array.from(this.users.values());

    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.name.toLowerCase().includes(search),
      );
    }

    return users
      .slice(params.skip, params.skip + params.take)
      .map((u) => this.stripPassword(u));
  }

  private findByEmailSync(email: string): UserWithPassword | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  private stripPassword(user: UserWithPassword): User {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}
