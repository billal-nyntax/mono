import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 150 })
  readonly totalProducts!: number;

  @ApiProperty({ example: 12 })
  readonly lowStockCount!: number;

  @ApiProperty({ example: 5 })
  readonly outOfStockCount!: number;

  @ApiProperty({ example: 8 })
  readonly todaySalesCount!: number;

  @ApiProperty({ example: 45000 })
  readonly todayRevenue!: number;

  @ApiProperty({ example: 12000 })
  readonly todayProfit!: number;

  @ApiProperty({ example: 1250000 })
  readonly totalRevenue!: number;
}
