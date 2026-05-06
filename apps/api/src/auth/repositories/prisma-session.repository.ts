import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import type { Session, SessionId, UserId } from '@repo/auth-core';
import { createSessionId } from '@repo/auth-core';
import { SessionRepository } from './session.repository';
import type { Session as PrismaSession } from '@repo/database';

@Injectable()
export class PrismaSessionRepository extends SessionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: SessionId): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });
    return session ? this.toDomain(session) : null;
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { token },
    });
    return session ? this.toDomain(session) : null;
  }

  async findByUserId(userId: UserId): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async create(data: {
    userId: UserId;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
    return this.toDomain(session);
  }

  async delete(id: SessionId): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteAllForUser(userId: UserId): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  private toDomain(raw: PrismaSession): Session {
    return {
      id: createSessionId(raw.id),
      userId: raw.userId as UserId,
      token: raw.token,
      expiresAt: raw.expiresAt,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      createdAt: raw.createdAt,
    };
  }
}
