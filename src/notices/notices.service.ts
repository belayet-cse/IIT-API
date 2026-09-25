import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { ReorderNoticesDto } from './dto/reorder-notices.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  // Public: only active notices, for the site-wide ticker.
  list() {
    return this.prisma.notice.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Admin: every notice regardless of active state, for the management page.
  adminList() {
    return this.prisma.notice.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(dto: CreateNoticeDto) {
    const last = await this.prisma.notice.findFirst({
      orderBy: { sortOrder: 'desc' },
    });
    return this.prisma.notice.create({
      data: {
        text: dto.text,
        href: dto.href || null,
        active: dto.active ?? true,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const existing = await this.prisma.notice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Notice not found.');

    return this.prisma.notice.update({
      where: { id },
      data: {
        text: dto.text,
        href: dto.href === undefined ? undefined : dto.href || null,
        active: dto.active,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.notice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Notice not found.');
    await this.prisma.notice.delete({ where: { id } });
    return { id };
  }

  async reorder(dto: ReorderNoticesDto) {
    await Promise.all(
      dto.orderedIds.map((id, index) =>
        this.prisma.notice.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.adminList();
  }
}
