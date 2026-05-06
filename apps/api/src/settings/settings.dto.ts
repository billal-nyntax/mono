import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiProperty({ required: false, example: 'My Shop' })
  @IsOptional()
  @IsString()
  readonly shopName?: string;

  @ApiProperty({ required: false, example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  readonly shopLogo?: string;

  @ApiProperty({ required: false, example: 'BDT' })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({ required: false, example: '৳' })
  @IsOptional()
  @IsString()
  readonly currencySymbol?: string;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly lowStockThreshold?: number;
}
