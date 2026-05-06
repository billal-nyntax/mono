import type { User, UserWithPassword, UserId } from '@repo/auth-core';

export interface CreateUserData {
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly phone?: string;
  readonly role?: 'user' | 'admin' | 'super_admin';
}

export interface UpdateUserData {
  readonly email?: string;
  readonly name?: string;
  readonly phone?: string | null;
  readonly role?: 'user' | 'admin' | 'super_admin';
  readonly emailVerified?: boolean;
  readonly twoFactorEnabled?: boolean;
  readonly twoFactorSecret?: string | null;
  readonly suspended?: boolean;
  readonly suspendedAt?: Date | null;
  readonly suspendedReason?: string | null;
}

export abstract class UserRepository {
  abstract findById(id: UserId): Promise<User | null>;
  abstract findByIdWithPassword(id: UserId): Promise<UserWithPassword | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  abstract create(data: CreateUserData): Promise<User>;
  abstract update(id: UserId, data: UpdateUserData): Promise<User>;
  abstract delete(id: UserId): Promise<void>;
  abstract count(): Promise<number>;
  abstract countFiltered(search?: string): Promise<number>;
  abstract findMany(params: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<User[]>;
}
