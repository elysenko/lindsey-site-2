import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { AdminInsightsController } from './admin-insights.controller';
import { InsightsService } from './insights.service';

@Module({
  controllers: [InsightsController, AdminInsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
