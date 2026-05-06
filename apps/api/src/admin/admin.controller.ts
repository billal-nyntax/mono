import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { User, Address } from '@repo/auth-core';
import { createUserId } from '@repo/auth-core';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from '../user/user.service';
import { AddressService } from '../address/address.service';
import { AdminService } from './admin.service';
import { PaginatedQueryDto } from '../common/dto/api-response.dto';
import type { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin')
@ApiTags('Admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly adminService: AdminService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getDashboard(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all users with pagination (super_admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  async listUsers(@Query() query: PaginatedQueryDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { users, total } = await this.userService.list({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    return {
      data: users,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get('users/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get user by ID (super_admin only)' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.findById(createUserId(id));
  }

  @Patch('users/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update user (super_admin only)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
  ): Promise<User> {
    return this.userService.update(createUserId(id), dto);
  }

  @Patch('users/:id/suspend')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Suspend a user account (super_admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async suspendUser(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<User> {
    return this.userService.suspend(createUserId(id), body.reason);
  }

  @Patch('users/:id/unsuspend')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Unsuspend a user account (super_admin only)' })
  @ApiResponse({ status: 200, description: 'User unsuspended' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unsuspendUser(@Param('id') id: string): Promise<User> {
    return this.userService.unsuspend(createUserId(id));
  }

  @Patch('users/:id/role')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Change user role (super_admin only)' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 403, description: 'Only super_admin can change roles' })
  async changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<User> {
    return this.userService.update(createUserId(id), { role: dto.role });
  }

  @Get('permissions/users')
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all users with roles for permission management' })
  @ApiResponse({ status: 200, description: 'Users with roles' })
  async listUsersForPermissions(@Query() query: PaginatedQueryDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { users, total } = await this.userService.list({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return {
      data: users,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Delete('users/:id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (super_admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(createUserId(id));
  }

  @Get('users/:id/addresses')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get user addresses (super_admin only)' })
  @ApiResponse({ status: 200, description: 'User addresses' })
  async getUserAddresses(@Param('id') id: string): Promise<Address[]> {
    return this.addressService.findByUserId(createUserId(id));
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all orders with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  async listOrders(@Query() query: PaginatedQueryDto) {
    return this.adminService.listOrders(query.page, query.limit);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.updateOrderStatus(id, dto.status, user.role);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all payments with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated payment list' })
  async listPayments(@Query() query: PaginatedQueryDto) {
    return this.adminService.listPayments(query.page, query.limit);
  }

  @Get('payments/stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get payment statistics (super_admin only)' })
  @ApiResponse({ status: 200, description: 'Payment statistics' })
  async getPaymentStats() {
    return this.adminService.getPaymentStats();
  }
}
