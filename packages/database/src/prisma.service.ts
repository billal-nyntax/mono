import { PrismaClient } from '@prisma/client';

export interface OnModuleInit {
  onModuleInit(): Promise<void>;
}

export interface OnModuleDestroy {
  onModuleDestroy(): Promise<void>;
}

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env['NODE_ENV'] === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
