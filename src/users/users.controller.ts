import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmAlumniCsvDto } from './dto/confirm-alumni-csv.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const CSV_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  adminList(@Query('search') search?: string) {
    return this.usersService.adminList({ search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/alumni-csv/preview')
  @UseInterceptors(FileInterceptor('file', CSV_UPLOAD_OPTIONS))
  previewAlumniCsv(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('CSV file is required.');
    return this.usersService.previewAlumniCsv(file.buffer.toString('utf-8'));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/alumni-csv/confirm')
  confirmAlumniCsv(@Body() dto: ConfirmAlumniCsvDto) {
    return this.usersService.confirmAlumniCsv(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
