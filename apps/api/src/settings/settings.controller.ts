import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';

@Controller('admin/settings')
@ApiTags('Settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles('super_admin')
@ApiBearerAuth('access-token')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get shop settings' })
  @ApiResponse({ status: 200, description: 'Shop settings' })
  async get() {
    return this.settingsService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update shop settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
