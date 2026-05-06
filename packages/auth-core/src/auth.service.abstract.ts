import type { UserId } from './types/branded';
import type { AuthResult, TwoFactorSetup } from './types/auth-result';
import type {
  SignUpDto,
  SignInDto,
  ResetPasswordDto,
  ChangePasswordDto,
  OAuthProvider,
} from './types/dto';
import type { Session, TokenPair } from './types/session';
import type { User } from './types/user';

export abstract class AuthService {
  abstract signUp(dto: Readonly<SignUpDto>): Promise<AuthResult>;

  abstract signIn(dto: Readonly<SignInDto>): Promise<AuthResult>;

  abstract signOut(sessionId: string): Promise<void>;

  abstract verifySession(token: string): Promise<Session | null>;

  abstract refreshToken(refreshToken: string): Promise<TokenPair>;

  abstract requestPasswordReset(email: string): Promise<void>;

  abstract resetPassword(dto: Readonly<ResetPasswordDto>): Promise<AuthResult>;

  abstract changePassword(
    userId: UserId,
    dto: Readonly<ChangePasswordDto>,
  ): Promise<void>;

  abstract socialLogin(
    provider: OAuthProvider,
    code: string,
    redirectUri: string,
  ): Promise<AuthResult>;

  abstract enable2FA(userId: UserId): Promise<TwoFactorSetup>;

  abstract verify2FA(userId: UserId, code: string): Promise<AuthResult>;

  abstract disable2FA(userId: UserId, code: string): Promise<void>;

  abstract getUser(userId: UserId): Promise<User | null>;
}
