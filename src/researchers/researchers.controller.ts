import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApplicationStatus, Role } from '@prisma/client';
import { ResearchersService } from './researchers.service';
import { CreateResearcherApplicationDto } from './dto/create-researcher-application.dto';
import { RejectResearcherApplicationDto } from './dto/reject-researcher-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Controller('researchers')
export class ResearchersController {
  constructor(private readonly researchersService: ResearchersService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Post('applications')
  createApplication(@Body() dto: CreateResearcherApplicationDto) {
    return this.researchersService.createApplication(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications/me')
  myApplication(@CurrentUser() user: AuthenticatedUser) {
    return this.researchersService.myApplication(user.email);
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/applications')
  listApplications(@Query('status') status?: ApplicationStatus) {
    return this.researchersService.listApplications(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/applications/:id/approve')
  approveApplication(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.researchersService.approveApplication(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/applications/:id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body() dto: RejectResearcherApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.researchersService.rejectApplication(id, user.userId, dto.reviewNote);
  }
}
