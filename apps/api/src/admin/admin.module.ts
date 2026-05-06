import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminStatsRepository } from './admin-stats.repository';
import { UserModule } from '../user/user.module';
import { AddressModule } from '../address/address.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, UserModule, AddressModule],
  controllers: [AdminController],
  providers: [AdminService, AdminStatsRepository],
})
export class AdminModule {}
