import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  estimateReadingTime,
  excerptFrom,
  slugify,
} from '../common/utils/slugify';
import { sanitizeContent } from '../common/utils/sanitize';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

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
        orderBy: { publishedAt: 'desc' },
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

  async findBySlug(slug: string) {
    const post = await this.prisma.blog.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
    if (!post || post.status !== BlogStatus.PUBLISHED) {
      throw new NotFoundException('Blog post not found.');
    }

    const updated = await this.prisma.blog.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      include: { author: { select: { name: true } } },
    });

    return this.toPublicDetail(updated);
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminList(query: { search?: string; status?: BlogStatus }) {
    const where: Prisma.BlogWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const posts = await this.prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      featuredImage: p.featuredImage,
      category: p.category,
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

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt || excerptFrom(content),
        content,
        featuredImage: dto.featuredImage,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        category: dto.category,
        status,
        price: dto.price ?? 0,
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
        category: dto.category,
        status: dto.status,
        price: dto.price,
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
      readingTime: post.readingTime,
      price: post.price,
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
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      category: post.category,
      readingTime: post.readingTime,
      price: post.price,
      views: post.views,
      author: post.author.name,
      publishedAt: post.publishedAt,
    };
  }
}
