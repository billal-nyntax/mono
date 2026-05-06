import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateAddressRequestDto {
  @ApiProperty({ example: 'Home', description: 'Address label' })
  @IsString()
  @MaxLength(50)
  readonly label!: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @MaxLength(200)
  readonly street!: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @MaxLength(100)
  readonly city!: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @MaxLength(100)
  readonly state!: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @MaxLength(20)
  readonly postalCode!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @MaxLength(2)
  readonly country!: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isDefault?: boolean;
}

export class UpdateAddressRequestDto {
  @ApiProperty({ example: 'Home', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly label?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly street?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  readonly postalCode?: string;

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  readonly country?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  readonly isDefault?: boolean;
}
