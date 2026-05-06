import type { UserId } from './branded';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly suspended: boolean;
  readonly suspendedAt: Date | null;
  readonly suspendedReason: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserWithPassword extends User {
  readonly passwordHash: string;
}
