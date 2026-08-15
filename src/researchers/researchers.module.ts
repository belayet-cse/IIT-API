import { Module } from '@nestjs/common';
import { ResearchersController } from './researchers.controller';
import { ResearchersService } from './researchers.service';

@Module({
  controllers: [ResearchersController],
  providers: [ResearchersService],
})
export class ResearchersModule {}
