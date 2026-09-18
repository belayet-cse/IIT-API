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
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const membership_service_1 = require("../membership/membership.service");
const slugify_1 = require("../common/utils/slugify");
const sanitize_1 = require("../common/utils/sanitize");
let BlogsService = class BlogsService {
    prisma;
    membershipService;
    constructor(prisma, membershipService) {
        this.prisma = prisma;
        this.membershipService = membershipService;
    }
    async getOgImage(slug) {
        const post = await this.prisma.blog.findUnique({
            where: { slug },
            select: { status: true, featuredImage: true },
        });
        if (!post || post.status !== client_1.BlogStatus.PUBLISHED || !post.featuredImage) {
            throw new common_1.NotFoundException('No featured image for this post.');
        }
        const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(post.featuredImage);
        if (!match)
            throw new common_1.NotFoundException('No featured image for this post.');
        return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') };
    }
    async list(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 10;
        const where = { status: client_1.BlogStatus.PUBLISHED };
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { excerpt: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.category)
            where.category = query.category;
        const [posts, total] = await Promise.all([
            this.prisma.blog.findMany({
                where,
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
    async findBySlug(slug, requestingUser) {
        const post = await this.prisma.blog.findUnique({
            where: { slug },
            include: { author: { select: { name: true } } },
        });
        if (!post)
            throw new common_1.NotFoundException('Blog post not found.');
        const isPreviewer = !!requestingUser &&
            (requestingUser.role === client_1.Role.ADMIN ||
                requestingUser.userId === post.authorId);
        if (post.status !== client_1.BlogStatus.PUBLISHED && !isPreviewer) {
            throw new common_1.NotFoundException('Blog post not found.');
        }
        let current = post;
        if (post.status === client_1.BlogStatus.PUBLISHED) {
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
        if (hasAccess)
            return this.toPublicDetail(current);
        const discountPercent = requestingUser
            ? (await this.membershipService.calculatePrice(requestingUser.userId, current.priceBdt)).discountPercent
            : 0;
        return this.toLockedDetail(current, discountPercent);
    }
    async hasBlogAccess(post, requestingUser) {
        if (post.priceBdt === 0 && post.priceUsd === 0)
            return true;
        if (!requestingUser)
            return false;
        if (requestingUser.role === client_1.Role.ADMIN)
            return true;
        if (requestingUser.userId === post.authorId)
            return true;
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
    async adminList(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.category)
            where.category = query.category;
        if (query.search) {
            where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
        }
        const posts = await this.prisma.blog.findMany({
            where,
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
    async adminFindById(id) {
        const post = await this.prisma.blog.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Blog post not found.');
        return post;
    }
    async create(dto, authorId) {
        const slug = await this.uniqueSlug(dto.slug || dto.title);
        const status = dto.status ?? client_1.BlogStatus.DRAFT;
        const content = (0, sanitize_1.sanitizeContent)(dto.content);
        const sequence = dto.sequence ?? (await this.nextSequence(dto.category));
        return this.prisma.blog.create({
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt || (0, slugify_1.excerptFrom)(content),
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
                readingTime: dto.readingTime ?? (0, slugify_1.estimateReadingTime)(content),
                publishedAt: status === client_1.BlogStatus.PUBLISHED ? new Date() : null,
                authorId,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.blog.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Blog post not found.');
        const slug = dto.slug && dto.slug !== existing.slug
            ? await this.uniqueSlug(dto.slug, id)
            : undefined;
        const nextStatus = dto.status ?? existing.status;
        const becomingPublished = nextStatus === client_1.BlogStatus.PUBLISHED && existing.publishedAt === null;
        const content = dto.content ? (0, sanitize_1.sanitizeContent)(dto.content) : undefined;
        const sequence = dto.sequence !== undefined
            ? dto.sequence
            : dto.category !== undefined && dto.category !== existing.category
                ? await this.nextSequence(dto.category)
                : undefined;
        return this.prisma.blog.update({
            where: { id },
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt || (content ? (0, slugify_1.excerptFrom)(content) : undefined),
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
                readingTime: dto.readingTime ??
                    (content ? (0, slugify_1.estimateReadingTime)(content) : undefined),
                publishedAt: becomingPublished ? new Date() : undefined,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.blog.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Blog post not found.');
        await this.prisma.blog.delete({ where: { id } });
        return { id };
    }
    async reorder(dto) {
        await Promise.all(dto.orderedIds.map((id, index) => this.prisma.blog.update({
            where: { id },
            data: { sequence: index },
        })));
        return this.adminList({ category: dto.category });
    }
    async uniqueSlug(source, excludeId) {
        const base = (0, slugify_1.slugify)(source);
        let candidate = base;
        let suffix = 1;
        while (await this.prisma.blog.findFirst({
            where: {
                slug: candidate,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        })) {
            suffix += 1;
            candidate = `${base}-${suffix}`;
        }
        if (!candidate)
            throw new common_1.ConflictException('Could not generate a slug for this post.');
        return candidate;
    }
    async nextSequence(category) {
        if (!category)
            return 0;
        const last = await this.prisma.blog.findFirst({
            where: { category },
            orderBy: { sequence: 'desc' },
        });
        return (last?.sequence ?? -1) + 1;
    }
    toPublicSummary(post) {
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
    toPublicDetail(post) {
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
    toLockedDetail(post, discountPercent) {
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
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        membership_service_1.MembershipService])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map