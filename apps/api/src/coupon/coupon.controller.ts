import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

// ── Admin CRUD ──────────────────────────────────────────────

@Controller('admin/coupons')
@ApiTags('Coupons (Admin)')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class CouponAdminController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @ApiOperation({ summary: 'List coupons with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated coupon list' })
  findMany(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.couponService.findMany(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findById(@Param('id') id: string) {
    return this.couponService.findById(id);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create coupon (super_admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update coupon (super_admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete coupon (super_admin only)' })
  @ApiResponse({ status: 204, description: 'Coupon deleted' })
  async delete(@Param('id') id: string) {
    await this.couponService.delete(id);
  }
}

// ── Shop validate endpoint ──────────────────────────────────

class ValidateCouponBody {
  @ApiProperty({ example: 'SUMMER2025' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderTotal!: number;
}

@Controller('shop/coupons')
@ApiTags('Coupons (Shop)')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class CouponShopController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon and calculate discount' })
  @ApiResponse({ status: 200, description: 'Coupon validated with discount amount' })
  @ApiResponse({ status: 400, description: 'Invalid or expired coupon' })
  validate(@Body() body: ValidateCouponBody) {
    return this.couponService.validateCoupon(body.code, body.orderTotal);
  }
}
