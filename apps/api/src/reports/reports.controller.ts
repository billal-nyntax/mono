import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { ReportsService } from './reports.service';

@Controller('admin/reports')
@ApiTags('Reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles('super_admin')
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get sales summary for a period' })
  @ApiResponse({ status: 200, description: 'Sales summary' })
  async getSummary(@Query('period') period: 'today' | 'week' | 'month' = 'month') {
    return this.reportsService.getSummary(period);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best selling products' })
  @ApiResponse({ status: 200, description: 'Best sellers list' })
  async getBestSellers(
    @Query('period') period: 'today' | 'week' | 'month' = 'month',
    @Query('limit') limit: number = 10,
  ) {
    return this.reportsService.getBestSellers(period, Number(limit) || 10);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: 200, description: 'Low stock products' })
  async getLowStock() {
    return this.reportsService.getLowStock();
  }

  @Get('profit')
  @ApiOperation({ summary: 'Get profit breakdown by product' })
  @ApiResponse({ status: 200, description: 'Profit by product' })
  async getProfitByProduct(@Query('period') period: 'today' | 'week' | 'month' = 'month') {
    return this.reportsService.getProfitByProduct(period);
  }
}
