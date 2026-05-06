import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsNumber,
  IsEnum,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxx' })
  @IsString()
  readonly productId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly quantity!: number;
}

export enum PaymentMethodDto {
  CASH = 'CASH',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  ROCKET = 'ROCKET',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateSaleDto {
  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  readonly customerName?: string;

  @ApiProperty({ required: false, example: '01712345678' })
  @IsOptional()
  @IsString()
  readonly customerPhone?: string;

  @ApiProperty({ enum: PaymentMethodDto, default: 'CASH', description: 'Payment method' })
  @IsOptional()
  @IsEnum(PaymentMethodDto)
  readonly paymentMethod?: PaymentMethodDto;

  @ApiProperty({ required: false, description: 'Discount amount (flat)', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly discount?: number;

  @ApiProperty({ required: false, description: 'Amount paid (for partial payment)', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly paidAmount?: number;

  @ApiProperty({ required: false, description: 'Transaction ID for online payments' })
  @IsOptional()
  @IsString()
  readonly transactionId?: string;

  @ApiProperty({ type: [SaleItemDto], description: 'Items to sell' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  readonly items!: SaleItemDto[];
}
