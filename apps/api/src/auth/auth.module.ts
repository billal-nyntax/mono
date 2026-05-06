import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@repo/auth-core';
import { BetterAuthServiceImpl } from '@repo/auth-better-auth';
import { PrismaService } from '@repo/database';
import { MailService, createMailService } from '@repo/mailer';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SessionRepository } from './repositories/session.repository';
import { PrismaSessionRepository } from './repositories/prisma-session.repository';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: MailService,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('MAIL_PROVIDER', 'console');
        return createMailService({
          provider: provider as 'smtp' | 'console',
          from: configService.get<string>('MAIL_FROM', 'TechHub BD <noreply@techhubbd.com>'),
          smtp: configService.get('SMTP_HOST')
            ? {
                host: configService.get<string>('SMTP_HOST', ''),
                port: configService.get<number>('SMTP_PORT', 587),
                secure: configService.get<string>('SMTP_SECURE', 'false') === 'true',
                user: configService.get<string>('SMTP_USER', ''),
                pass: configService.get<string>('SMTP_PASS', ''),
              }
            : undefined,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: AuthService,
      useFactory: (configService: ConfigService, prisma: PrismaService, mailer: MailService) => {
        return new BetterAuthServiceImpl(
          {
            jwtSecret: configService.get<string>('JWT_SECRET', ''),
            baseUrl: configService.get<string>('API_BASE_URL', 'http://localhost:4000'),
            frontendUrl: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
            google: configService.get('GOOGLE_CLIENT_ID')
              ? {
                  clientId: configService.get<string>('GOOGLE_CLIENT_ID', ''),
                  clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
                }
              : undefined,
            github: configService.get('GITHUB_CLIENT_ID')
              ? {
                  clientId: configService.get<string>('GITHUB_CLIENT_ID', ''),
                  clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET', ''),
                }
              : undefined,
          },
          prisma,
          mailer,
        );
      },
      inject: [ConfigService, PrismaService, MailService],
    },
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    AuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, AuthGuard, RolesGuard, SessionRepository, MailService],
})
export class AuthModule {}
