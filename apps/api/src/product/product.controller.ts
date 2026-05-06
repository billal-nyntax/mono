import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { ProductService } from './product.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { ProductEntity } from './repositories/product.repository';

@Controller('admin/products')
@ApiTags('Products')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products with pagination, search, and filters' })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  async findMany(@Query() query: ProductQueryDto) {
    return this.productService.findMany(query);
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get all distinct product brands' })
  @ApiResponse({ status: 200, description: 'List of brands' })
  async getBrands(): Promise<string[]> {
    return this.productService.getBrands();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id') id: string): Promise<ProductEntity> {
    return this.productService.findById(id);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create product (super_admin only)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 409, description: 'Slug or SKU already exists' })
  async create(@Body() dto: CreateProductDto): Promise<ProductEntity> {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update product (super_admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product (super_admin only)' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.productService.delete(id);
  }
}
