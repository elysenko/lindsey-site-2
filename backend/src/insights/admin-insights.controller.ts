import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { CreateInsightDto, UpdateInsightDto } from './dto/insights.dto';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionPayload } from '../auth/session.types';

@ApiTags('admin-insights')
@ApiCookieAuth()
@Controller('admin/insights')
@UseGuards(AdminGuard)
export class AdminInsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'List all insights (draft + published)' })
  list() {
    return this.insights.adminList();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an insight by id for editing' })
  get(@Param('id') id: string) {
    return this.insights.adminGet(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create an insight (≥1500 words required to publish)',
  })
  create(
    @Body() dto: CreateInsightDto,
    @CurrentUser() user: SessionPayload,
  ) {
    return this.insights.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an insight; publishing enforces ≥1500 words',
  })
  update(@Param('id') id: string, @Body() dto: UpdateInsightDto) {
    return this.insights.update(id, dto);
  }
}
