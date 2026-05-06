import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressRepository } from './repositories/address.repository';
import { PrismaAddressRepository } from './repositories/prisma-address.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AddressController],
  providers: [
    AddressService,
    { provide: AddressRepository, useClass: PrismaAddressRepository },
  ],
  exports: [AddressService],
})
export class AddressModule {}
