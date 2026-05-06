import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tablet' })
  @IsString()
  @MaxLength(50)
  readonly name!: string;

  @ApiProperty({ example: 'tablet' })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase with hyphens' })
  readonly slug!: string;

  @ApiProperty({ example: 'Tablet', required: false, description: 'Lucide icon name' })
  @IsOptional()
  @IsString()
  readonly icon?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase with hyphens' })
  readonly slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly icon?: string;
}

export class CreateBrandDto {
  @ApiProperty({ example: 'Samsung' })
  @IsString()
  @MaxLength(50)
  readonly name!: string;

  @ApiProperty({ example: 'samsung' })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase with hyphens' })
  readonly slug!: string;

  @ApiProperty({ required: false, description: 'Brand logo URL' })
  @IsOptional()
  @IsString()
  readonly logo?: string;
}

export class UpdateBrandDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase with hyphens' })
  readonly slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly logo?: string;
}
