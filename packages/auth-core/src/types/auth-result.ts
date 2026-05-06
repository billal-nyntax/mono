import type { TokenPair } from './session';
import type { User } from './user';

export type AuthResult =
  | { readonly success: true; readonly user: User; readonly tokens: TokenPair }
  | { readonly success: false; readonly error: AuthError };

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_EXISTS'
  | 'REQUIRES_2FA'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_SUSPENDED'
  | 'INVALID_RESET_TOKEN'
  | 'PASSWORD_MISMATCH'
  | 'WEAK_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'TOKEN_EXPIRED';

interface BaseAuthError {
  readonly code: AuthErrorCode;
  readonly message: string;
}

export type AuthError =
  | (BaseAuthError & { readonly code: 'REQUIRES_2FA'; readonly challengeId: string })
  | (BaseAuthError & { readonly code: 'ACCOUNT_LOCKED'; readonly lockedUntil: Date })
  | (BaseAuthError & { readonly code: Exclude<AuthErrorCode, 'REQUIRES_2FA' | 'ACCOUNT_LOCKED'> });

export interface TwoFactorSetup {
  readonly secret: string;
  readonly qrCodeUrl: string;
  readonly backupCodes: readonly string[];
}
