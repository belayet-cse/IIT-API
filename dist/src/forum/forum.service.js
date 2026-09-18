"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let ForumService = class ForumService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(user, query) {
        await this.assertAccess(user);
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 20;
        const where = {};
        if (query.category)
            where.category = query.category;
        if (query.search) {
            where.title = { contains: query.search, mode: 'insensitive' };
        }
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
    async findById(user, id) {
        await this.assertAccess(user);
        const thread = await this.prisma.forumThread.findUnique({
            where: { id },
            include: { author: { select: { role: true } } },
        });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found.');
        const [updated, posts] = await Promise.all([
            this.prisma.forumThread.update({
                where: { id },
                data: { views: { increment: 1 } },
                include: { author: { select: { name: true, role: true, organization: true } } },
            }),
            this.prisma.forumPost.findMany({
                where: { threadId: id },
                orderBy: { createdAt: 'asc' },
                include: {
                    author: { select: { id: true, name: true, role: true, organization: true } },
                },
            }),
        ]);
        const [myPostLikes, myThreadLike] = await Promise.all([
            posts.length
                ? this.prisma.forumPostLike.findMany({
                    where: { userId: user.userId, postId: { in: posts.map((p) => p.id) } },
                    select: { postId: true },
                })
                : Promise.resolve([]),
            this.prisma.forumThreadLike.findUnique({
                where: { threadId_userId: { threadId: id, userId: user.userId } },
            }),
        ]);
        const likedPostIds = new Set(myPostLikes.map((l) => l.postId));
        return {
            ...this.toDetail(updated),
            isLiked: !!myThreadLike,
            replies: posts.map((p) => ({
                id: p.id,
                content: p.content,
                author: p.author.name,
                authorId: p.authorId,
                authorRole: p.author.role,
                authorOrganization: p.author.organization,
                parentPostId: p.parentPostId,
                likeCount: p.likeCount,
                isLiked: likedPostIds.has(p.id),
                createdAt: p.createdAt,
            })),
        };
    }
    async createThread(user, dto) {
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
    async createReply(user, threadId, dto) {
        await this.assertAccess(user);
        const thread = await this.prisma.forumThread.findUnique({
            where: { id: threadId },
        });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found.');
        if (thread.locked)
            throw new common_1.BadRequestException('This thread is locked and no longer accepting replies.');
        if (dto.parentPostId) {
            const parent = await this.prisma.forumPost.findUnique({
                where: { id: dto.parentPostId },
            });
            if (!parent || parent.threadId !== threadId) {
                throw new common_1.BadRequestException('The post being replied to does not belong to this thread.');
            }
        }
        const [post] = await this.prisma.$transaction([
            this.prisma.forumPost.create({
                data: {
                    threadId,
                    authorId: user.userId,
                    content: dto.content,
                    parentPostId: dto.parentPostId,
                },
            }),
            this.prisma.forumThread.update({
                where: { id: threadId },
                data: { replyCount: { increment: 1 }, lastActivityAt: new Date() },
            }),
        ]);
        return { id: post.id };
    }
    async toggleLike(user, postId) {
        await this.assertAccess(user);
        const post = await this.prisma.forumPost.findUnique({
            where: { id: postId },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found.');
        const existing = await this.prisma.forumPostLike.findUnique({
            where: { postId_userId: { postId, userId: user.userId } },
        });
        if (existing) {
            const [, updated] = await this.prisma.$transaction([
                this.prisma.forumPostLike.delete({ where: { id: existing.id } }),
                this.prisma.forumPost.update({
                    where: { id: postId },
                    data: { likeCount: { decrement: 1 } },
                }),
            ]);
            return { liked: false, likeCount: updated.likeCount };
        }
        const [, updated] = await this.prisma.$transaction([
            this.prisma.forumPostLike.create({
                data: { postId, userId: user.userId },
            }),
            this.prisma.forumPost.update({
                where: { id: postId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);
        return { liked: true, likeCount: updated.likeCount };
    }
    async adminList(query) {
        const where = {};
        if (query.category)
            where.category = query.category;
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
    async updateThread(id, dto) {
        const existing = await this.prisma.forumThread.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Thread not found.');
        return this.prisma.forumThread.update({ where: { id }, data: dto });
    }
    async removeThread(id) {
        const existing = await this.prisma.forumThread.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Thread not found.');
        await this.prisma.forumThread.delete({ where: { id } });
        return { id };
    }
    async removePost(id) {
        const post = await this.prisma.forumPost.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Reply not found.');
        await this.prisma.$transaction([
            this.prisma.forumPost.delete({ where: { id } }),
            this.prisma.forumThread.update({
                where: { id: post.threadId },
                data: { replyCount: { decrement: 1 } },
            }),
        ]);
        return { id };
    }
    async assertAccess(user) {
        if (user.role !== client_1.Role.ALUMNI)
            return;
        const profile = await this.prisma.alumniProfile.findUnique({
            where: { userId: user.userId },
        });
        if (!profile?.forumAccess) {
            throw new common_1.ForbiddenException('Your forum access has been disabled. Contact an admin for details.');
        }
    }
    toSummary(thread) {
        return {
            id: thread.id,
            title: thread.title,
            category: thread.category,
            author: thread.author.name,
            authorId: thread.authorId,
            pinned: thread.pinned,
            locked: thread.locked,
            replyCount: thread.replyCount,
            views: thread.views,
            lastActivityAt: thread.lastActivityAt,
            createdAt: thread.createdAt,
        };
    }
    toDetail(thread) {
        return {
            id: thread.id,
            title: thread.title,
            content: thread.content,
            category: thread.category,
            author: thread.author.name,
            authorId: thread.authorId,
            authorRole: thread.author.role,
            authorOrganization: thread.author.organization,
            pinned: thread.pinned,
            locked: thread.locked,
            replyCount: thread.replyCount,
            views: thread.views,
            likeCount: thread.likeCount,
            lastActivityAt: thread.lastActivityAt,
            createdAt: thread.createdAt,
        };
    }
    async toggleThreadLike(user, threadId) {
        await this.assertAccess(user);
        const thread = await this.prisma.forumThread.findUnique({
            where: { id: threadId },
        });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found.');
        const existing = await this.prisma.forumThreadLike.findUnique({
            where: { threadId_userId: { threadId, userId: user.userId } },
        });
        if (existing) {
            const [, updated] = await this.prisma.$transaction([
                this.prisma.forumThreadLike.delete({ where: { id: existing.id } }),
                this.prisma.forumThread.update({
                    where: { id: threadId },
                    data: { likeCount: { decrement: 1 } },
                }),
            ]);
            return { liked: false, likeCount: updated.likeCount };
        }
        const [, updated] = await this.prisma.$transaction([
            this.prisma.forumThreadLike.create({
                data: { threadId, userId: user.userId },
            }),
            this.prisma.forumThread.update({
                where: { id: threadId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);
        return { liked: true, likeCount: updated.likeCount };
    }
};
exports.ForumService = ForumService;
exports.ForumService = ForumService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ForumService);
//# sourceMappingURL=forum.service.js.map