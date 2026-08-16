import { Module } from '@nestjs/common';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [MembershipModule],
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
