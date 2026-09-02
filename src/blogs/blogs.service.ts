import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MembershipService } from '../membership/membership.service';
import {
  estimateReadingTime,
  excerptFrom,
  slugify,
} from '../common/utils/slugify';
import { sanitizeContent } from '../common/utils/sanitize';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ReorderBlogsDto } from './dto/reorder-blogs.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Injectable()
export class BlogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────

  // Decodes the stored `data:image/...;base64,...` featuredImage into raw
  // bytes so social-media crawlers (which can't render data: URIs) get a
  // real fetchable og:image URL.
  async getOgImage(slug: string) {
    const post = await this.prisma.blog.findUnique({
      where: { slug },
      select: { status: true, featuredImage: true },
    });
    if (!post || post.status !== BlogStatus.PUBLISHED || !post.featuredImage) {
      throw new NotFoundException('No featured image for this post.');
    }

    const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(
      post.featuredImage,
    );
    if (!match) throw new NotFoundException('No featured image for this post.');

    return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') };
  }

  async list(query: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 10;

    const where: Prisma.BlogWhereInput = { status: BlogStatus.PUBLISHED };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = query.category;

    // Plain Promise.all rather than $transaction: the two queries don't need
    // atomicity, and interactive transactions are unreliable against pooled
    // Postgres endpoints (e.g. PgBouncer/Neon), each needing its own held
    // connection for the transaction's lifetime.
    const [posts, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        // Within a category, respect the writer's chosen display order;
        // the unfiltered feed stays newest-first.
        orderBy: query.category ? { sequence: 'asc' } : { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data: posts.map((p) => this.toPublicSummary(p)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  // REQ-083: price = 0 stays free for everyone; price > 0 requires either
  // being the author/an admin or a SUCCESS Payment for this post (the
  // Premium/Alumni discount from the same engine used for memberships
  // applies to what they'd pay, but doesn't grant access by itself).
  //
  // A DRAFT post is otherwise invisible (404), except to its author or an
  // admin — this is what powers the admin panel's "Preview" button, letting
  // a draft be checked exactly as readers will see it before it's published.
  async findBySlug(slug: string, requestingUser?: AuthenticatedUser) {
    const post = await this.prisma.blog.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found.');

    const isPreviewer =
      !!requestingUser &&
      (requestingUser.role === Role.ADMIN ||
        requestingUser.userId === post.authorId);
    if (post.status !== BlogStatus.PUBLISHED && !isPreviewer) {
      throw new NotFoundException('Blog post not found.');
    }

    // A draft preview isn't a real reader visit — don't count it.
    let current = post;
    if (post.status === BlogStatus.PUBLISHED) {
      const [updated] = await this.prisma.$transaction([
        this.prisma.blog.update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
          include: { author: { select: { name: true } } },
        }),
        this.prisma.contentView.create({
          data: { type: 'BLOG', contentId: post.id },
        }),
      ]);
      current = updated;
    }

    const hasAccess = await this.hasBlogAccess(current, requestingUser);
    if (hasAccess) return this.toPublicDetail(current);

    const discountPercent = requestingUser
      ? (
          await this.membershipService.calculatePrice(
            requestingUser.userId,
            current.priceBdt,
          )
        ).discountPercent
      : 0;
    return this.toLockedDetail(current, discountPercent);
  }

  private async hasBlogAccess(
    post: { id: string; priceBdt: number; priceUsd: number; authorId: string },
    requestingUser?: AuthenticatedUser,
  ): Promise<boolean> {
    if (post.priceBdt === 0 && post.priceUsd === 0) return true;
    if (!requestingUser) return false;
    if (requestingUser.role === Role.ADMIN) return true;
    if (requestingUser.userId === post.authorId) return true;

    const payment = await this.prisma.payment.findFirst({
      where: {
        userId: requestingUser.userId,
        blogId: post.id,
        type: 'BLOG',
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
    const where: Prisma.BlogWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const posts = await this.prisma.blog.findMany({
      where,
      // Filtering to a single category surfaces the writer's chosen
      // sequence; otherwise show the most recently published posts first
      // (drafts, which have no publishedAt yet, fall back to newest-created).
      orderBy: query.category
        ? { sequence: 'asc' }
        : [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      include: { author: { select: { name: true } } },
    });

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      featuredImage: p.featuredImage,
      category: p.category,
      subCategory: p.subCategory,
      tags: p.tags,
      sequence: p.sequence,
      status: p.status,
      views: p.views,
      readingTime: p.readingTime,
      author: p.author.name,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
    }));
  }

  async adminFindById(id: string) {
    const post = await this.prisma.blog.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  async create(dto: CreateBlogDto, authorId: string) {
    const slug = await this.uniqueSlug(dto.slug || dto.title);
    const status = dto.status ?? BlogStatus.DRAFT;
    const content = sanitizeContent(dto.content);
    const sequence = dto.sequence ?? (await this.nextSequence(dto.category));

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt || excerptFrom(content),
        content,
        featuredImage: dto.featuredImage,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        category: dto.category,
        subCategory: dto.subCategory,
        tags: dto.tags ?? [],
        sequence,
        status,
        priceBdt: dto.priceBdt ?? 0,
        priceUsd: dto.priceUsd ?? 0,
        readingTime: dto.readingTime ?? estimateReadingTime(content),
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdateBlogDto) {
    const existing = await this.prisma.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found.');

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.uniqueSlug(dto.slug, id)
        : undefined;
    const nextStatus = dto.status ?? existing.status;
    const becomingPublished =
      nextStatus === BlogStatus.PUBLISHED && existing.publishedAt === null;
    const content = dto.content ? sanitizeContent(dto.content) : undefined;
    // Moving to a different category re-appends to the end of that
    // category's order unless the caller set an explicit sequence.
    const sequence =
      dto.sequence !== undefined
        ? dto.sequence
        : dto.category !== undefined && dto.category !== existing.category
          ? await this.nextSequence(dto.category)
          : undefined;

    return this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt || (content ? excerptFrom(content) : undefined),
        content,
        featuredImage: dto.featuredImage,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        category: dto.category,
        subCategory: dto.subCategory,
        tags: dto.tags,
        sequence,
        status: dto.status,
        priceBdt: dto.priceBdt,
        priceUsd: dto.priceUsd,
        readingTime:
          dto.readingTime ??
          (content ? estimateReadingTime(content) : undefined),
        publishedAt: becomingPublished ? new Date() : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found.');
    await this.prisma.blog.delete({ where: { id } });
    return { id };
  }

  async reorder(dto: ReorderBlogsDto) {
    await Promise.all(
      dto.orderedIds.map((id, index) =>
        this.prisma.blog.update({
          where: { id },
          data: { sequence: index },
        }),
      ),
    );
    return this.adminList({ category: dto.category });
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
      await this.prisma.blog.findFirst({
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
      throw new ConflictException('Could not generate a slug for this post.');
    return candidate;
  }

  private async nextSequence(category?: string | null): Promise<number> {
    if (!category) return 0;
    const last = await this.prisma.blog.findFirst({
      where: { category },
      orderBy: { sequence: 'desc' },
    });
    return (last?.sequence ?? -1) + 1;
  }

  private toPublicSummary(
    post: Prisma.BlogGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      readingTime: post.readingTime,
      priceBdt: post.priceBdt,
      priceUsd: post.priceUsd,
      views: post.views,
      author: post.author.name,
      publishedAt: post.publishedAt,
    };
  }

  private toPublicDetail(
    post: Prisma.BlogGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      locked: false,
      featuredImage: post.featuredImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      metaKeywords: post.metaKeywords,
      category: post.category,
      subCategory: post.subCategory,
      tags: post.tags,
      readingTime: post.readingTime,
      priceBdt: post.priceBdt,
      priceUsd: post.priceUsd,
      discountPercent: 0,
      views: post.views,
      author: post.author.name,
      publishedAt: post.publishedAt,
    };
  }

  private toLockedDetail(
    post: Prisma.BlogGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
    discountPercent: number,
  ) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: null,
      locked: true,
      featuredImage: post.featuredImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      metaKeywords: post.metaKeywords,
      category: post.category,
      subCategory: post.subCategory,
      tags: post.tags,
      readingTime: post.readingTime,
      priceBdt: post.priceBdt,
      priceUsd: post.priceUsd,
      discountPercent,
      views: post.views,
      author: post.author.name,
      publishedAt: post.publishedAt,
    };
  }
}
