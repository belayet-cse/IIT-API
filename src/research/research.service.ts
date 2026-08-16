import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MembershipService } from '../membership/membership.service';
import { estimateReadingTime, slugify } from '../common/utils/slugify';
import { sanitizeContent } from '../common/utils/sanitize';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Injectable()
export class ResearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────

  async list(query: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 12;

    const where: Prisma.ResearchPaperWhereInput = {
      status: BlogStatus.PUBLISHED,
    };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { abstract: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = query.category;

    const [papers, total] = await Promise.all([
      this.prisma.researchPaper.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      this.prisma.researchPaper.count({ where }),
    ]);

    return {
      data: papers.map((p) => this.toPublicSummary(p)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  // REQ-081: abstract is always public; content requires either being the
  // author/an admin or a SUCCESS Payment for this paper (free papers, price
  // 0, are open to everyone). Same discount engine as Blog/Membership.
  async findBySlug(slug: string, requestingUser?: AuthenticatedUser) {
    const paper = await this.prisma.researchPaper.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
    if (!paper || paper.status !== BlogStatus.PUBLISHED) {
      throw new NotFoundException('Research paper not found.');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.researchPaper.update({
        where: { id: paper.id },
        data: { views: { increment: 1 } },
        include: { author: { select: { name: true } } },
      }),
      this.prisma.contentView.create({
        data: { type: 'RESEARCH', contentId: paper.id },
      }),
    ]);

    const hasAccess = await this.hasPaperAccess(updated, requestingUser);
    if (hasAccess) return this.toPublicDetail(updated);

    const discountPercent = requestingUser
      ? (
          await this.membershipService.calculatePrice(
            requestingUser.userId,
            updated.priceBdt,
          )
        ).discountPercent
      : 0;
    return this.toLockedDetail(updated, discountPercent);
  }

  private async hasPaperAccess(
    paper: { id: string; priceBdt: number; priceUsd: number; authorId: string },
    requestingUser?: AuthenticatedUser,
  ): Promise<boolean> {
    if (paper.priceBdt === 0 && paper.priceUsd === 0) return true;
    if (!requestingUser) return false;
    if (requestingUser.role === Role.ADMIN) return true;
    if (requestingUser.userId === paper.authorId) return true;

    const payment = await this.prisma.payment.findFirst({
      where: {
        userId: requestingUser.userId,
        paperId: paper.id,
        type: 'RESEARCH',
        status: 'SUCCESS',
      },
    });
    return !!payment;
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminList(query: {
    search?: string;
    status?: BlogStatus;
    category?: string;
  }) {
    const where: Prisma.ResearchPaperWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const papers = await this.prisma.researchPaper.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return papers.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      featuredImage: p.featuredImage,
      category: p.category,
      tags: p.tags,
      status: p.status,
      priceBdt: p.priceBdt,
      priceUsd: p.priceUsd,
      views: p.views,
      readingTime: p.readingTime,
      author: p.author.name,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
    }));
  }

  async adminFindById(id: string) {
    const paper = await this.prisma.researchPaper.findUnique({ where: { id } });
    if (!paper) throw new NotFoundException('Research paper not found.');
    return paper;
  }

  async create(dto: CreatePaperDto, authorId: string) {
    const slug = await this.uniqueSlug(dto.slug || dto.title);
    const status = dto.status ?? BlogStatus.DRAFT;
    const content = sanitizeContent(dto.content);

    return this.prisma.researchPaper.create({
      data: {
        title: dto.title,
        slug,
        abstract: dto.abstract,
        content,
        featuredImage: dto.featuredImage,
        category: dto.category,
        tags: dto.tags ?? [],
        status,
        priceBdt: dto.priceBdt ?? 0,
        priceUsd: dto.priceUsd ?? 0,
        certification: dto.certification,
        readingTime: dto.readingTime ?? estimateReadingTime(content),
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdatePaperDto) {
    const existing = await this.prisma.researchPaper.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Research paper not found.');

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.uniqueSlug(dto.slug, id)
        : undefined;
    const nextStatus = dto.status ?? existing.status;
    const becomingPublished =
      nextStatus === BlogStatus.PUBLISHED && existing.publishedAt === null;
    const content = dto.content ? sanitizeContent(dto.content) : undefined;

    return this.prisma.researchPaper.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        abstract: dto.abstract,
        content,
        featuredImage: dto.featuredImage,
        category: dto.category,
        tags: dto.tags,
        status: dto.status,
        priceBdt: dto.priceBdt,
        priceUsd: dto.priceUsd,
        certification: dto.certification,
        readingTime:
          dto.readingTime ??
          (content ? estimateReadingTime(content) : undefined),
        publishedAt: becomingPublished ? new Date() : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.researchPaper.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Research paper not found.');
    await this.prisma.researchPaper.delete({ where: { id } });
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
      await this.prisma.researchPaper.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      })
    ) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    if (!candidate)
      throw new ConflictException('Could not generate a slug for this paper.');
    return candidate;
  }

  private toPublicSummary(
    paper: Prisma.ResearchPaperGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      title: paper.title,
      slug: paper.slug,
      abstract: paper.abstract,
      featuredImage: paper.featuredImage,
      category: paper.category,
      tags: paper.tags,
      readingTime: paper.readingTime,
      priceBdt: paper.priceBdt,
      priceUsd: paper.priceUsd,
      certification: paper.certification,
      views: paper.views,
      author: paper.author.name,
      publishedAt: paper.publishedAt,
    };
  }

  private toPublicDetail(
    paper: Prisma.ResearchPaperGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      id: paper.id,
      title: paper.title,
      slug: paper.slug,
      abstract: paper.abstract,
      content: paper.content,
      locked: false,
      featuredImage: paper.featuredImage,
      category: paper.category,
      tags: paper.tags,
      readingTime: paper.readingTime,
      priceBdt: paper.priceBdt,
      priceUsd: paper.priceUsd,
      certification: paper.certification,
      discountPercent: 0,
      views: paper.views,
      author: paper.author.name,
      publishedAt: paper.publishedAt,
    };
  }

  private toLockedDetail(
    paper: Prisma.ResearchPaperGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
    discountPercent: number,
  ) {
    return {
      id: paper.id,
      title: paper.title,
      slug: paper.slug,
      abstract: paper.abstract,
      content: null,
      locked: true,
      featuredImage: paper.featuredImage,
      category: paper.category,
      tags: paper.tags,
      readingTime: paper.readingTime,
      priceBdt: paper.priceBdt,
      priceUsd: paper.priceUsd,
      certification: paper.certification,
      discountPercent,
      views: paper.views,
      author: paper.author.name,
      publishedAt: paper.publishedAt,
    };
  }
}
