import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponAdminController, CouponShopController } from './coupon.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CouponAdminController, CouponShopController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
