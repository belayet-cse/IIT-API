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
import { SubCategoriesService } from './subcategories.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { ReorderSubCategoriesDto } from './dto/reorder-subcategories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('subcategories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  list(@Query('categoryId') categoryId?: string) {
    return this.subCategoriesService.list(categoryId);
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  create(@Body() dto: CreateSubCategoryDto) {
    return this.subCategoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/reorder')
  reorder(@Body() dto: ReorderSubCategoriesDto) {
    return this.subCategoriesService.reorder(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
    return this.subCategoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.subCategoriesService.remove(id);
  }
}
