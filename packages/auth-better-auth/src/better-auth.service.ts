import {
  AuthService,
  type AuthResult,
  type TwoFactorSetup,
  type Session,
  type TokenPair,
  type User,
  type UserId,
  type SignUpDto,
  type SignInDto,
  type ResetPasswordDto,
  type ChangePasswordDto,
  type OAuthProvider,
  createUserId,
  createSessionId,
} from '@repo/auth-core';
import { PrismaService } from '@repo/database';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { BetterAuthConfig } from './better-auth.config';
import type { MailService } from '@repo/mailer';
import { verificationEmail, passwordResetEmail } from '@repo/mailer';

export class BetterAuthServiceImpl extends AuthService {
  protected readonly config: BetterAuthConfig;
  private readonly prisma: PrismaService;
  private readonly mailer: MailService | null;

  constructor(config: BetterAuthConfig, prisma: PrismaService, mailer?: MailService) {
    super();
    this.config = config;
    this.prisma = prisma;
    this.mailer = mailer ?? null;
  }

  async signUp(dto: Readonly<SignUpDto>): Promise<AuthResult> {
    if (dto.password !== dto.confirmPassword) {
      return { success: false, error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' } };
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      return { success: false, error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } };
    }

    const passwordHash = this.hashPassword(dto.password);

    const dbUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone ?? null,
        passwordHash,
        role: 'USER',
        emailVerified: false,
      },
    });

    await this.sendVerificationEmail(dbUser.id, dbUser.email, dbUser.name);

    const user = this.mapUser(dbUser);
    const tokens = this.generateTokens();

    await this.prisma.session.create({
      data: {
        userId: dbUser.id,
        token: tokens.accessToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    });

    return { success: true, user, tokens };
  }

  async signIn(dto: Readonly<SignInDto>): Promise<AuthResult> {
    const dbUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!dbUser) {
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
    }

    if (dbUser.suspended) {
      return { success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended' } };
    }

    if (!this.verifyPassword(dto.password, dbUser.passwordHash)) {
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
    }

    const user = this.mapUser(dbUser);
    const tokens = this.generateTokens();

    await this.prisma.session.create({
      data: {
        userId: dbUser.id,
        token: tokens.accessToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    });

    return { success: true, user, tokens };
  }

  async signOut(sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
  }

  async verifySession(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return null;

    return {
      id: createSessionId(session.id),
      userId: createUserId(session.userId),
      token: session.token,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
    };
  }

  async refreshToken(_refreshToken: string): Promise<TokenPair> {
    return this.generateTokens();
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    await this.prisma.token.deleteMany({
      where: { userId: user.id, type: 'PASSWORD_RESET', revoked: false },
    });

    const tokenValue = randomBytes(32).toString('hex');
    await this.prisma.token.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        token: tokenValue,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    if (this.mailer) {
      const frontendUrl = this.config.frontendUrl ?? 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${tokenValue}`;
      const template = passwordResetEmail(user.name, resetLink);
      await this.mailer.send({ to: user.email, ...template });
    }
  }

  async resetPassword(dto: Readonly<ResetPasswordDto>): Promise<AuthResult> {
    if (dto.password !== dto.confirmPassword) {
      return { success: false, error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' } };
    }

    const tokenRecord = await this.prisma.token.findUnique({ where: { token: dto.token } });

    if (!tokenRecord || tokenRecord.type !== 'PASSWORD_RESET' || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return { success: false, error: { code: 'INVALID_RESET_TOKEN', message: 'Invalid or expired reset token' } };
    }

    const passwordHash = this.hashPassword(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.token.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      }),
    ]);

    const dbUser = await this.prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!dbUser) {
      return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
    }

    const user = this.mapUser(dbUser);
    const tokens = this.generateTokens();

    await this.prisma.session.create({
      data: {
        userId: dbUser.id,
        token: tokens.accessToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    });

    return { success: true, user, tokens };
  }

  async verifyEmail(tokenValue: string): Promise<{ success: boolean; message: string }> {
    const tokenRecord = await this.prisma.token.findUnique({ where: { token: tokenValue } });

    if (!tokenRecord || tokenRecord.type !== 'EMAIL_VERIFICATION' || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return { success: false, message: 'Invalid or expired verification link' };
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: true },
      }),
      this.prisma.token.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      }),
    ]);

    return { success: true, message: 'Email verified successfully' };
  }

  async resendVerificationEmail(userId: UserId): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return;

    await this.sendVerificationEmail(user.id, user.email, user.name);
  }

  async changePassword(userId: UserId, dto: Readonly<ChangePasswordDto>): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || !this.verifyPassword(dto.currentPassword, dbUser.passwordHash)) {
      throw new Error('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: this.hashPassword(dto.newPassword) },
    });
  }

  async socialLogin(_provider: OAuthProvider, _code: string, _redirectUri: string): Promise<AuthResult> {
    return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'OAuth login not configured' } };
  }

  async enable2FA(_userId: UserId): Promise<TwoFactorSetup> {
    const secret = randomBytes(20).toString('hex');
    return {
      secret,
      qrCodeUrl: `otpauth://totp/AuthApp?secret=${secret}`,
      backupCodes: Array.from({ length: 8 }, () => randomBytes(4).toString('hex')),
    };
  }

  async verify2FA(_userId: UserId, _code: string): Promise<AuthResult> {
    return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid 2FA code' } };
  }

  async disable2FA(_userId: UserId, _code: string): Promise<void> {}

  async getUser(userId: UserId): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    return dbUser ? this.mapUser(dbUser) : null;
  }

  private async sendVerificationEmail(userId: string, email: string, name: string): Promise<void> {
    if (!this.mailer) return;

    await this.prisma.token.deleteMany({
      where: { userId, type: 'EMAIL_VERIFICATION', revoked: false },
    });

    const tokenValue = randomBytes(32).toString('hex');
    await this.prisma.token.create({
      data: {
        userId,
        type: 'EMAIL_VERIFICATION',
        token: tokenValue,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const frontendUrl = this.config.frontendUrl ?? 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/verify-email?token=${tokenValue}`;
    const template = verificationEmail(name, verifyLink);
    await this.mailer.send({ to: email, ...template });
  }

  private mapUser(dbUser: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    suspended: boolean;
    suspendedAt: Date | null;
    suspendedReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: createUserId(dbUser.id),
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      role: dbUser.role === 'ADMIN' ? 'admin' : dbUser.role === 'SUPER_ADMIN' ? 'super_admin' : 'user',
      emailVerified: dbUser.emailVerified,
      twoFactorEnabled: dbUser.twoFactorEnabled,
      suspended: dbUser.suspended,
      suspendedAt: dbUser.suspendedAt,
      suspendedReason: dbUser.suspendedReason,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedHash = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuffer, derivedHash);
  }

  private generateTokens(): TokenPair {
    const THIRTY_DAYS = 30 * 24 * 60 * 60;
    return {
      accessToken: randomBytes(32).toString('hex'),
      refreshToken: randomBytes(32).toString('hex'),
      expiresIn: THIRTY_DAYS,
    };
  }
}
