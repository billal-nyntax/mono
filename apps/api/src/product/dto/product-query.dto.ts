import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum ProductStatusEnum {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum ProductSortBy {
  NAME = 'name',
  PURCHASE_PRICE = 'purchasePrice',
  SELLING_PRICE = 'sellingPrice',
  STOCK = 'stockQuantity',
  CREATED = 'createdAt',
  UPDATED = 'updatedAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ProductQueryDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page: number = 1;

  @ApiProperty({ example: 20, required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  readonly limit: number = 20;

  @ApiProperty({ required: false, description: 'Search by name, brand, SKU, model, or category' })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiProperty({ required: false, description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  readonly categoryId?: string;

  @ApiProperty({ required: false, description: 'Filter by brand ID' })
  @IsOptional()
  @IsString()
  readonly brandId?: string;

  @ApiProperty({ required: false, enum: ProductStatusEnum, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProductStatusEnum)
  readonly status?: ProductStatusEnum;

  @ApiProperty({ required: false, description: 'Filter products with low stock' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  readonly lowStock?: boolean;

  @ApiProperty({ required: false, enum: ProductSortBy, default: ProductSortBy.CREATED })
  @IsOptional()
  @IsEnum(ProductSortBy)
  readonly sortBy: ProductSortBy = ProductSortBy.CREATED;

  @ApiProperty({ required: false, enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  readonly sortOrder: SortOrder = SortOrder.DESC;
}
