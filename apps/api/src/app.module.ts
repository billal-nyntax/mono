import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { AdminModule } from './admin/admin.module';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { CategoryModule } from './category/category.module';
import { UploadModule } from './upload/upload.module';
import { ShopModule } from './shop/shop.module';
import { CouponModule } from './coupon/coupon.module';
import { PaymentModule } from './payment/payment.module';
import { DatabaseModule } from './config/database.module';
import { envValidation } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    AddressModule,
    AdminModule,
    CategoryModule,
    ProductModule,
    StockModule,
    SalesModule,
    ReportsModule,
    SettingsModule,
    UploadModule,
    ShopModule,
    CouponModule,
    PaymentModule,
  ],
})
export class AppModule {}
