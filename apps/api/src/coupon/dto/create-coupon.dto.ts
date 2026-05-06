import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER2025', description: 'Unique coupon code (uppercase, no spaces)' })
  @IsString()
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must be uppercase alphanumeric (hyphens and underscores allowed, no spaces)',
  })
  readonly code!: string;

  @ApiProperty({ required: false, example: 'Summer sale 10% off' })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ enum: DiscountType, example: 'PERCENTAGE' })
  @IsEnum(DiscountType)
  readonly discountType!: DiscountType;

  @ApiProperty({ example: 10, description: 'Discount value (percentage or fixed amount)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly discountValue!: number;

  @ApiProperty({ required: false, example: 500, description: 'Minimum order amount to apply coupon' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly minOrderAmount?: number;

  @ApiProperty({ required: false, example: 1000, description: 'Maximum discount cap' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  readonly maxDiscount?: number;

  @ApiProperty({ required: false, example: 100, description: 'Total allowed uses' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly usageLimit?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiProperty({ required: false, example: '2025-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  readonly startsAt?: string;

  @ApiProperty({ required: false, example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  readonly expiresAt?: string;
}
