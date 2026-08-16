import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogStatus, Role } from '@prisma/client';
import { ResearchService } from './research.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  list(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.researchService.list({
      search,
      category,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // ── Admin: manage papers (declared before the public :slug route) ──────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  adminList(
    @Query('search') search?: string,
    @Query('status') status?: BlogStatus,
    @Query('category') category?: string,
  ) {
    return this.researchService.adminList({ search, status, category });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  create(@Body() dto: CreatePaperDto, @CurrentUser() user: AuthenticatedUser) {
    return this.researchService.create(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/:id')
  adminFindById(@Param('id') id: string) {
    return this.researchService.adminFindById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePaperDto) {
    return this.researchService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }

  // ── Public: single paper (kept last — most generic :slug route) ────────

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.researchService.findBySlug(slug, user);
  }
}
