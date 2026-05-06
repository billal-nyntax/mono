import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CategoryService } from './category.service';
import { BrandService } from './brand.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateBrandDto, UpdateBrandDto } from './dto/create-category.dto';

@Controller('admin/catalog')
@ApiTags('Catalog (Categories & Brands)')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
  ) {}

  // ── Categories ──

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  @ApiResponse({ status: 200, description: 'Categories with product count' })
  async listCategories() {
    return this.categoryService.findAll();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category (only if no products)' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 409, description: 'Cannot delete — has products' })
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.delete(id);
  }

  // ── Brands ──

  @Get('brands')
  @ApiOperation({ summary: 'List all brands' })
  @ApiResponse({ status: 200, description: 'Brands with product count' })
  async listBrands() {
    return this.brandService.findAll();
  }

  @Post('brands')
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({ status: 201, description: 'Brand created' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async createBrand(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Patch('brands/:id')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({ status: 200, description: 'Brand updated' })
  async updateBrand(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete('brands/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a brand (only if no products)' })
  @ApiResponse({ status: 204, description: 'Brand deleted' })
  @ApiResponse({ status: 409, description: 'Cannot delete — has products' })
  async deleteBrand(@Param('id') id: string) {
    await this.brandService.delete(id);
  }
}
