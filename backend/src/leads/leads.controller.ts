import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionPayload } from '../auth/session.types';

@ApiTags('admin-leads')
@ApiCookieAuth()
@Controller('admin/leads')
@UseGuards(AdminGuard)
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads (paginated, filter by status/challenge, sort)' })
  list(@Query() query: ListLeadsDto) {
    return this.leads.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lead detail with brief, notes, and audit trail' })
  get(@Param('id') id: string) {
    return this.leads.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update lead status/notes/brief-fields (brief edits are audited)',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: SessionPayload,
  ) {
    return this.leads.update(id, dto, user.userId);
  }
}
