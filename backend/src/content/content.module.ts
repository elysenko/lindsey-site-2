import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { TeamController } from './team.controller';

@Module({
  controllers: [ContentController, TeamController],
})
export class ContentModule {}
