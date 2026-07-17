import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { RateLimitGuard } from '../common/rate-limit.guard';

@Module({
  controllers: [ConsultationController],
  providers: [ConsultationService, RateLimitGuard],
})
export class ConsultationModule {}
