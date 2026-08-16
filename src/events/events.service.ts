import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  async list(query: {
    when?: 'upcoming' | 'past';
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 12;

    const where: Prisma.EventWhereInput = { status: BlogStatus.PUBLISHED };
    if (query.when === 'upcoming') where.startAt = { gte: new Date() };
    if (query.when === 'past') where.startAt = { lt: new Date() };
    if (query.featured) where.featured = true;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { startAt: query.when === 'past' ? 'desc' : 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((e) => this.toSummary(e)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
    if (!event || event.status !== BlogStatus.PUBLISHED) {
      throw new NotFoundException('Event not found.');
    }
    return this.toSummary(event);
  }

  private toSummary(
    e: Prisma.EventGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      title: e.title,
      slug: e.slug,
      description: e.description,
      startAt: e.startAt,
      location: e.location,
      format: e.format,
      featuredImage: e.featuredImage,
      featured: e.featured,
      author: e.author.name,
    };
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminList(query: { search?: string; status?: BlogStatus }) {
    const where: Prisma.EventWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { startAt: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      startAt: e.startAt,
      location: e.location,
      format: e.format,
      featured: e.featured,
      status: e.status,
      author: e.author.name,
      updatedAt: e.updatedAt,
    }));
  }

  async adminFindById(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found.');
    return event;
  }

  async create(dto: CreateEventDto, authorId: string) {
    const slug = await this.uniqueSlug(dto.slug || dto.title);
    return this.prisma.event.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        startAt: new Date(dto.startAt),
        location: dto.location,
        format: dto.format ?? 'IN_PERSON',
        featuredImage: dto.featuredImage,
        featured: dto.featured ?? false,
        status: dto.status ?? BlogStatus.DRAFT,
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found.');

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.uniqueSlug(dto.slug, id)
        : undefined;

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        location: dto.location,
        format: dto.format,
        featuredImage: dto.featuredImage,
        featured: dto.featured,
        status: dto.status,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found.');
    await this.prisma.event.delete({ where: { id } });
    return { id };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async uniqueSlug(
    source: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(source);
    let candidate = base;
    let suffix = 1;

    while (
      await this.prisma.event.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      })
    ) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    if (!candidate) {
      throw new ConflictException('Could not generate a slug for this event.');
    }
    return candidate;
  }
}
