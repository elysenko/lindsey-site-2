import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('admin-settings')
@ApiCookieAuth()
@Controller('admin/settings')
@UseGuards(AdminGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List settings with masked values + configured flags' })
  list() {
    return this.settings.list();
  }

  @Patch()
  @ApiOperation({ summary: 'Upsert setting key/value pairs' })
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto.settings);
  }
}
