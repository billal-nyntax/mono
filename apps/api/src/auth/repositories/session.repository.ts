import type { Session, SessionId, UserId } from '@repo/auth-core';

export abstract class SessionRepository {
  abstract findById(id: SessionId): Promise<Session | null>;
  abstract findByToken(token: string): Promise<Session | null>;
  abstract findByUserId(userId: UserId): Promise<Session[]>;
  abstract create(data: {
    userId: UserId;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Session>;
  abstract delete(id: SessionId): Promise<void>;
  abstract deleteAllForUser(userId: UserId): Promise<void>;
  abstract deleteExpired(): Promise<number>;
}
