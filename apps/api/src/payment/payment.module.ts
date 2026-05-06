import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentGateway, createPaymentGateway } from '@repo/payment';
import type { PaymentConfig } from '@repo/payment';
import { AuthModule } from '../auth/auth.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: PaymentGateway,
      useFactory: (configService: ConfigService): PaymentGateway => {
        const provider = configService.get<PaymentConfig['provider']>(
          'PAYMENT_GATEWAY',
          'sslcommerz',
        );

        const config: PaymentConfig = {
          provider,
          sslcommerz: {
            storeId: configService.get<string>('SSL_STORE_ID', ''),
            storePass: configService.get<string>('SSL_STORE_PASS', ''),
            sandbox: configService.get<string>('SSL_SANDBOX', 'true') === 'true',
          },
        };

        return createPaymentGateway(config);
      },
      inject: [ConfigService],
    },
    PaymentService,
  ],
  exports: [PaymentGateway],
})
export class PaymentModule {}
