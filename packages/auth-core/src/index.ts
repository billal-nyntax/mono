export { AuthService } from './auth.service.abstract';

export type {
  UserId,
  SessionId,
  TokenId,
  AddressId,
} from './types/branded';

export {
  createUserId,
  createSessionId,
  createTokenId,
  createAddressId,
} from './types/branded';

export type { User, UserWithPassword, UserRole } from './types/user';
export type { Session, SessionWithUser, TokenPair } from './types/session';
export type { Address } from './types/address';
export type { AuthResult, AuthError, AuthErrorCode, TwoFactorSetup } from './types/auth-result';
export type {
  SignUpDto,
  SignInDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  Verify2FADto,
  OAuthProvider,
  OAuthLoginDto,
} from './types/dto';
