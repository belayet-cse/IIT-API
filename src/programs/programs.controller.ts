import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { BlogStatus, Role } from '@prisma/client';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  list(
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.programsService.list({
      type,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // ── Members ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll')
  enroll(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.programsService.enroll(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/modules/:moduleId/complete')
  completeModule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.programsService.completeModule(user, id, moduleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/certificate')
  async getCertificate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const { buffer, filename } = await this.programsService.getCertificate(
      user,
      id,
    );
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  // ── Admin: manage programs (declared before the public :slug route) ────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  adminList(
    @Query('search') search?: string,
    @Query('status') status?: BlogStatus,
    @Query('type') type?: string,
  ) {
    return this.programsService.adminList({ search, status, type });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  create(
    @Body() dto: CreateProgramDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.programsService.create(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/:id')
  adminFindById(@Param('id') id: string) {
    return this.programsService.adminFindById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.programsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.programsService.remove(id);
  }

  // ── Public: single program (kept last — most generic :slug route) ──────

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.programsService.findBySlug(slug, user);
  }
}
