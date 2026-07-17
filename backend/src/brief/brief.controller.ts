import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BriefService } from './brief.service';
import { SubmitBriefDto } from './dto/submit-brief.dto';

@ApiTags('brief')
@Controller('brief')
export class BriefController {
  constructor(private readonly brief: BriefService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Load a brand brief by token (404 if invalid)' })
  get(@Param('token') token: string) {
    return this.brief.getByToken(token);
  }

  @Post(':token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit/complete a brand brief (404 if invalid)' })
  submit(@Param('token') token: string, @Body() dto: SubmitBriefDto) {
    return this.brief.submit(token, dto);
  }
}
