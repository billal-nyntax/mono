import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  readonly productId!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly quantity!: number;
}

export class ShippingAddressDto {
  @IsString()
  readonly name!: string;

  @IsString()
  readonly phone!: string;

  @IsString()
  readonly address!: string;

  @IsString()
  readonly city!: string;

  @IsString()
  readonly area!: string;
}

export enum PaymentMethodEnum {
  COD = 'COD',
  SSLCOMMERZ = 'SSLCOMMERZ',
  BKASH = 'BKASH',
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  readonly items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  readonly shippingAddress!: ShippingAddressDto;

  @IsEnum(PaymentMethodEnum)
  readonly paymentMethod!: PaymentMethodEnum;

  @IsOptional()
  @IsString()
  readonly couponCode?: string;

  @IsOptional()
  @IsString()
  readonly customerNote?: string;
}
