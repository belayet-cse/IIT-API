import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ReorderPartnersDto } from './dto/reorder-partners.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(dto: CreatePartnerDto) {
    const last = await this.prisma.partner.findFirst({
      orderBy: { sortOrder: 'desc' },
    });
    return this.prisma.partner.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  }

  async update(id: string, dto: UpdatePartnerDto) {
    const existing = await this.prisma.partner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Partner not found.');

    return this.prisma.partner.update({
      where: { id },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.partner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Partner not found.');
    await this.prisma.partner.delete({ where: { id } });
    return { id };
  }

  async reorder(dto: ReorderPartnersDto) {
    await Promise.all(
      dto.orderedIds.map((id, index) =>
        this.prisma.partner.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.list();
  }
}
