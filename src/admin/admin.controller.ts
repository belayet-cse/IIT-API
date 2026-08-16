import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { ConfirmGoLiveDto } from './dto/confirm-go-live.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const CSV_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
};

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('analytics')
  analytics() {
    return this.adminService.analytics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('go-live/preview')
  @UseInterceptors(FileInterceptor('file', CSV_UPLOAD_OPTIONS))
  previewGoLive(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('CSV file is required.');
    return this.adminService.previewGoLive(file.buffer.toString('utf-8'));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('go-live/confirm')
  confirmGoLive(@Body() dto: ConfirmGoLiveDto) {
    return this.adminService.confirmGoLive(dto);
  }
}
