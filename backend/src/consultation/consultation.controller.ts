import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { RateLimit } from '../common/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit.guard';
import { getClientIp } from '../common/client-ip.util';

@ApiTags('consultation')
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultation: ConsultationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  @RateLimit({ action: 'consultation', limit: 5, windowMinutes: 60 })
  @ApiOperation({
    summary:
      'Submit a consultation request (rate-limited 5/60min/IP). Returns a brief token.',
  })
  async create(
    @Body() dto: CreateConsultationDto,
    @Req() req: Request,
  ): Promise<{ briefToken: string }> {
    return this.consultation.create(dto, getClientIp(req));
  }
}
