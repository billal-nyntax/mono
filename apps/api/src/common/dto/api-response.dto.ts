import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  readonly success!: boolean;

  @ApiProperty({ description: 'Response payload' })
  readonly data!: T;

  @ApiProperty({ example: null, nullable: true })
  readonly error!: string | null;

  @ApiProperty({ example: '2026-04-30T05:00:00.000Z' })
  readonly timestamp!: string;
}

export class PaginatedQueryDto {
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

  @ApiProperty({ required: false, description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  readonly search?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty()
  readonly data!: T[];

  @ApiProperty({ example: 100 })
  readonly total!: number;

  @ApiProperty({ example: 1 })
  readonly page!: number;

  @ApiProperty({ example: 20 })
  readonly limit!: number;

  @ApiProperty({ example: 5 })
  readonly totalPages!: number;
}
