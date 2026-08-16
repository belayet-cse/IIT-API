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
import { Role } from '@prisma/client';
import { ForumService } from './forum.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // ── Members (Premium + Alumni + Admin only) ────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PREMIUM, Role.ALUMNI, Role.ADMIN)
  @Get('threads')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.forumService.list(user, {
      category,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PREMIUM, Role.ALUMNI, Role.ADMIN)
  @Post('threads')
  createThread(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateThreadDto,
  ) {
    return this.forumService.createThread(user, dto);
  }

  // ── Admin: moderation (declared before the generic :id route) ─────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/threads')
  adminList(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.forumService.adminList({ search, category });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/threads/:id')
  updateThread(@Param('id') id: string, @Body() dto: UpdateThreadDto) {
    return this.forumService.updateThread(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/threads/:id')
  removeThread(@Param('id') id: string) {
    return this.forumService.removeThread(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/posts/:id')
  removePost(@Param('id') id: string) {
    return this.forumService.removePost(id);
  }

  // ── Members: single thread + replies (generic :id, kept last) ──────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PREMIUM, Role.ALUMNI, Role.ADMIN)
  @Get('threads/:id')
  findById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.forumService.findById(user, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PREMIUM, Role.ALUMNI, Role.ADMIN)
  @Post('threads/:id/replies')
  createReply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
  ) {
    return this.forumService.createReply(user, id, dto);
  }
}
