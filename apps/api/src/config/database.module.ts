import { Global, Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (): PrismaService => new PrismaService(),
    },
  ],
  exports: [PrismaService],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.prisma.onModuleInit();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.onModuleDestroy();
  }
}
