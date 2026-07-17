import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { ListInsightsDto } from './dto/insights.dto';

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'List published insights (paginated)' })
  list(@Query() query: ListInsightsDto) {
    return this.insights.listPublished(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Published insight by slug (404 if draft/unknown)' })
  get(@Param('slug') slug: string) {
    return this.insights.getPublishedBySlug(slug);
  }
}
