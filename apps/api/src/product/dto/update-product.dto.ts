import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsEnum,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';


export enum UpdateProductStatusInput {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only',
  })
  readonly slug?: string;

  @ApiProperty({ required: false, description: 'Category ID' })
  @IsOptional()
  @IsString()
  readonly categoryId?: string;

  @ApiProperty({ required: false, description: 'Brand ID' })
  @IsOptional()
  @IsString()
  readonly brandId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly model?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  readonly description?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly purchasePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly sellingPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly stockQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly sku?: string | null;

  @ApiProperty({ required: false, type: [String], description: 'Image URLs (max 5)' })
  @IsOptional()
  @IsString({ each: true })
  readonly images?: string[];

  @ApiProperty({ required: false, enum: UpdateProductStatusInput })
  @IsOptional()
  @IsEnum(UpdateProductStatusInput)
  readonly status?: UpdateProductStatusInput;
}
