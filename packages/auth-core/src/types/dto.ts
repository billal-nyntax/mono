export interface SignUpDto {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly name: string;
  readonly phone?: string | undefined;
}

export interface SignInDto {
  readonly email: string;
  readonly password: string;
}

export interface ForgotPasswordDto {
  readonly email: string;
}

export interface ResetPasswordDto {
  readonly token: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface ChangePasswordDto {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export interface Verify2FADto {
  readonly userId: string;
  readonly code: string;
}

export type OAuthProvider = 'google' | 'github';

export interface OAuthLoginDto {
  readonly provider: OAuthProvider;
  readonly code: string;
  readonly redirectUri: string;
}
