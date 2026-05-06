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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('admin/sales')
@ApiTags('Sales')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'List sales with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated sales list' })
  async findMany(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.salesService.findMany(Number(page) || 1, Number(limit) || 20);
  }

  @Get('invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Get sale by invoice number' })
  @ApiResponse({ status: 200, description: 'Sale detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findByInvoice(@Param('invoiceNumber') invoiceNumber: string) {
    return this.salesService.findByInvoice(invoiceNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id') id: string) {
    return this.salesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async create(@Body() dto: CreateSaleDto) {
    return this.salesService.createSale(dto);
  }
}
