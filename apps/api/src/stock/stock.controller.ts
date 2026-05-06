import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StockService } from './stock.service';
import { StockAddDto, StockRemoveDto } from './dto/stock.dto';
import type { User } from '@repo/auth-core';

@Controller('admin/stock')
@ApiTags('Stock')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: 'Get stock overview with pagination' })
  @ApiResponse({ status: 200, description: 'Stock overview' })
  async getStockOverview(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.stockService.getStockOverview(
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Post(':productId/add')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Add stock to a product (super_admin only)' })
  @ApiResponse({ status: 201, description: 'Stock added' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addStock(
    @Param('productId') productId: string,
    @Body() dto: StockAddDto,
    @CurrentUser() user: User,
  ) {
    return this.stockService.addStock(productId, dto.quantity, dto.reason, user.id);
  }

  @Post(':productId/remove')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Remove stock from a product (super_admin only)' })
  @ApiResponse({ status: 201, description: 'Stock removed' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async removeStock(
    @Param('productId') productId: string,
    @Body() dto: StockRemoveDto,
    @CurrentUser() user: User,
  ) {
    return this.stockService.removeStock(productId, dto.quantity, dto.reason, user.id);
  }

  @Get(':productId/history')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get stock movement history (super_admin only)' })
  @ApiResponse({ status: 200, description: 'Stock movement history' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getHistory(
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.stockService.getHistory(productId, Number(page) || 1, Number(limit) || 20);
  }
}
