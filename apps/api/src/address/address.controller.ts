import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import type { Address, User } from '@repo/auth-core';
import { createAddressId } from '@repo/auth-core';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddressService } from './address.service';
import {
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from './dto/create-address.dto';

@Controller('addresses')
@ApiTags('Addresses')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'List current user addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  async list(@CurrentUser() user: User): Promise<Address[]> {
    return this.addressService.findByUserId(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateAddressRequestDto,
  ): Promise<Address> {
    return this.addressService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAddressRequestDto,
  ): Promise<Address> {
    return this.addressService.update(createAddressId(id), user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 204, description: 'Address deleted' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.addressService.delete(createAddressId(id), user.id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({ status: 200, description: 'Default address updated' })
  async setDefault(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.addressService.setDefault(createAddressId(id), user.id);
    return { message: 'Default address updated' };
  }
}
