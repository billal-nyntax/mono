import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import type { User } from '@repo/auth-core';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ShopService } from './shop.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'price' | 'name' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.shopService.getProducts({
      page,
      limit,
      search,
      categoryId,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('products/:slug')
  getProductBySlug(@Param('slug') slug: string) {
    return this.shopService.getProductBySlug(slug);
  }

  @Get('categories')
  getCategories() {
    return this.shopService.getCategories();
  }

  @Get('brands')
  getBrands() {
    return this.shopService.getBrands();
  }

  @Post('orders')
  @UseGuards(AuthGuard)
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.shopService.createOrder(user.id, dto);
  }

  @Get('orders')
  @UseGuards(AuthGuard)
  getUserOrders(@CurrentUser() user: User) {
    return this.shopService.getUserOrders(user.id);
  }
}
