import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './repositories/product.repository';
import { PrismaProductRepository } from './repositories/prisma-product.repository';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: ProductRepository, useClass: PrismaProductRepository },
  ],
  exports: [ProductService],
})
export class ProductModule {}
