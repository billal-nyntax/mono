import type { SessionId, UserId } from './branded';
import type { User } from './user';

export interface Session {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly token: string;
  readonly expiresAt: Date;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;
}

export interface SessionWithUser extends Session {
  readonly user: User;
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}
