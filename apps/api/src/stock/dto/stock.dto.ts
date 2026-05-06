import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StockAddDto {
  @ApiProperty({ example: 10, description: 'Quantity to add' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly quantity!: number;

  @ApiProperty({ required: false, example: 'New shipment received' })
  @IsOptional()
  @IsString()
  readonly reason?: string;
}

export class StockRemoveDto {
  @ApiProperty({ example: 5, description: 'Quantity to remove' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly quantity!: number;

  @ApiProperty({ required: false, example: 'Damaged items' })
  @IsOptional()
  @IsString()
  readonly reason?: string;
}
