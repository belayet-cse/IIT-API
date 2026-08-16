import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Members ─────────────────────────────────────────────────────────────

  async list(
    user: AuthenticatedUser,
    query: { category?: string; page?: number; limit?: number },
  ) {
    await this.assertAccess(user);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 20;

    const where: Prisma.ForumThreadWhereInput = {};
    if (query.category) where.category = query.category;

    const [threads, total] = await Promise.all([
      this.prisma.forumThread.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { lastActivityAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      this.prisma.forumThread.count({ where }),
    ]);

    return {
      data: threads.map((t) => this.toSummary(t)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(user: AuthenticatedUser, id: string) {
    await this.assertAccess(user);

    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    });
    if (!thread) throw new NotFoundException('Thread not found.');

    const [updated, posts] = await Promise.all([
      this.prisma.forumThread.update({
        where: { id },
        data: { views: { increment: 1 } },
        include: { author: { select: { name: true } } },
      }),
      this.prisma.forumPost.findMany({
        where: { threadId: id },
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { name: true } } },
      }),
    ]);

    return {
      ...this.toDetail(updated),
      replies: posts.map((p) => ({
        id: p.id,
        content: p.content,
        author: p.author.name,
        createdAt: p.createdAt,
      })),
    };
  }

  async createThread(user: AuthenticatedUser, dto: CreateThreadDto) {
    await this.assertAccess(user);
    const thread = await this.prisma.forumThread.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        authorId: user.userId,
      },
    });
    return { id: thread.id };
  }

  async createReply(
    user: AuthenticatedUser,
    threadId: string,
    dto: CreateReplyDto,
  ) {
    await this.assertAccess(user);

    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found.');
    if (thread.locked)
      throw new BadRequestException(
        'This thread is locked and no longer accepting replies.',
      );

    const [post] = await this.prisma.$transaction([
      this.prisma.forumPost.create({
        data: { threadId, authorId: user.userId, content: dto.content },
      }),
      this.prisma.forumThread.update({
        where: { id: threadId },
        data: { replyCount: { increment: 1 }, lastActivityAt: new Date() },
      }),
    ]);

    return { id: post.id };
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminList(query: { search?: string; category?: string }) {
    const where: Prisma.ForumThreadWhereInput = {};
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
    }

    const threads = await this.prisma.forumThread.findMany({
      where,
      orderBy: { lastActivityAt: 'desc' },
      include: { author: { select: { name: true, email: true } } },
    });

    return threads.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      authorName: t.author.name,
      authorEmail: t.author.email,
      pinned: t.pinned,
      locked: t.locked,
      replyCount: t.replyCount,
      views: t.views,
      createdAt: t.createdAt,
      lastActivityAt: t.lastActivityAt,
    }));
  }

  async updateThread(id: string, dto: UpdateThreadDto) {
    const existing = await this.prisma.forumThread.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Thread not found.');
    return this.prisma.forumThread.update({ where: { id }, data: dto });
  }

  async removeThread(id: string) {
    const existing = await this.prisma.forumThread.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Thread not found.');
    await this.prisma.forumThread.delete({ where: { id } });
    return { id };
  }

  async removePost(id: string) {
    const post = await this.prisma.forumPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Reply not found.');

    await this.prisma.$transaction([
      this.prisma.forumPost.delete({ where: { id } }),
      this.prisma.forumThread.update({
        where: { id: post.threadId },
        data: { replyCount: { decrement: 1 } },
      }),
    ]);
    return { id };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  // REQ-080: Premium (any tier) + Alumni + Admin only; the RolesGuard already
  // blocks everyone else before this runs. Alumni additionally need their
  // per-profile forumAccess flag (admin-revocable, previously unenforced).
  private async assertAccess(user: AuthenticatedUser): Promise<void> {
    if (user.role !== Role.ALUMNI) return;

    const profile = await this.prisma.alumniProfile.findUnique({
      where: { userId: user.userId },
    });
    if (!profile?.forumAccess) {
      throw new ForbiddenException(
        'Your forum access has been disabled. Contact an admin for details.',
      );
    }
  }

  private toSummary(
    thread: Prisma.ForumThreadGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      id: thread.id,
      title: thread.title,
      category: thread.category,
      author: thread.author.name,
      pinned: thread.pinned,
      locked: thread.locked,
      replyCount: thread.replyCount,
      views: thread.views,
      lastActivityAt: thread.lastActivityAt,
      createdAt: thread.createdAt,
    };
  }

  private toDetail(
    thread: Prisma.ForumThreadGetPayload<{
      include: { author: { select: { name: true } } };
    }>,
  ) {
    return {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      category: thread.category,
      author: thread.author.name,
      pinned: thread.pinned,
      locked: thread.locked,
      replyCount: thread.replyCount,
      views: thread.views,
      lastActivityAt: thread.lastActivityAt,
      createdAt: thread.createdAt,
    };
  }
}
