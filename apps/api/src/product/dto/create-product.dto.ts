import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro' })
  @IsString()
  @MaxLength(200)
  readonly name!: string;

  @ApiProperty({ example: 'iphone-15-pro' })
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only',
  })
  readonly slug!: string;

  @ApiProperty({ description: 'Category ID', example: 'clxxxxxxxxxxxxxxx' })
  @IsString()
  readonly categoryId!: string;

  @ApiProperty({ description: 'Brand ID', example: 'clxxxxxxxxxxxxxxx' })
  @IsString()
  readonly brandId!: string;

  @ApiProperty({ example: 'A2848', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly model?: string;

  @ApiProperty({ example: 'Latest iPhone with A17 Pro chip', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  readonly description?: string;

  @ApiProperty({ example: 95000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly purchasePrice!: number;

  @ApiProperty({ example: 115000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly sellingPrice!: number;

  @ApiProperty({ example: 10, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly stockQuantity?: number;

  @ApiProperty({ example: 'IPH-15PRO-256', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly sku?: string;

  @ApiProperty({ required: false, type: [String], description: 'Image URLs (max 5)' })
  @IsOptional()
  @IsString({ each: true })
  readonly images?: string[];

  @ApiProperty({ required: false, description: 'Product specifications (key-value pairs)', example: { RAM: '8GB', Display: '6.7" AMOLED', Battery: '5000mAh' } })
  @IsOptional()
  readonly specifications?: Record<string, string>;

  @ApiProperty({ required: false, description: 'Compare at / MRP price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly compareAtPrice?: number;
}
