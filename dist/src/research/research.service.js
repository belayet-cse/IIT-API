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
exports.ResearchService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const membership_service_1 = require("../membership/membership.service");
const slugify_1 = require("../common/utils/slugify");
const sanitize_1 = require("../common/utils/sanitize");
let ResearchService = class ResearchService {
    prisma;
    membershipService;
    constructor(prisma, membershipService) {
        this.prisma = prisma;
        this.membershipService = membershipService;
    }
    async list(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 12;
        const where = {
            status: client_1.BlogStatus.PUBLISHED,
        };
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { abstract: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.category)
            where.category = query.category;
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
    async findBySlug(slug, requestingUser) {
        const paper = await this.prisma.researchPaper.findUnique({
            where: { slug },
            include: { author: { select: { name: true } } },
        });
        if (!paper || paper.status !== client_1.BlogStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Research paper not found.');
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
        if (hasAccess)
            return this.toPublicDetail(updated);
        const discountPercent = requestingUser
            ? (await this.membershipService.calculatePrice(requestingUser.userId, updated.priceBdt)).discountPercent
            : 0;
        return this.toLockedDetail(updated, discountPercent);
    }
    async hasPaperAccess(paper, requestingUser) {
        if (paper.priceBdt === 0 && paper.priceUsd === 0)
            return true;
        if (!requestingUser)
            return false;
        if (requestingUser.role === client_1.Role.ADMIN)
            return true;
        if (requestingUser.userId === paper.authorId)
            return true;
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
    async adminList(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.category)
            where.category = query.category;
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
    async adminFindById(id) {
        const paper = await this.prisma.researchPaper.findUnique({ where: { id } });
        if (!paper)
            throw new common_1.NotFoundException('Research paper not found.');
        return paper;
    }
    async create(dto, authorId) {
        const slug = await this.uniqueSlug(dto.slug || dto.title);
        const status = dto.status ?? client_1.BlogStatus.DRAFT;
        const content = (0, sanitize_1.sanitizeContent)(dto.content);
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
                readingTime: dto.readingTime ?? (0, slugify_1.estimateReadingTime)(content),
                publishedAt: status === client_1.BlogStatus.PUBLISHED ? new Date() : null,
                authorId,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.researchPaper.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Research paper not found.');
        const slug = dto.slug && dto.slug !== existing.slug
            ? await this.uniqueSlug(dto.slug, id)
            : undefined;
        const nextStatus = dto.status ?? existing.status;
        const becomingPublished = nextStatus === client_1.BlogStatus.PUBLISHED && existing.publishedAt === null;
        const content = dto.content ? (0, sanitize_1.sanitizeContent)(dto.content) : undefined;
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
                readingTime: dto.readingTime ??
                    (content ? (0, slugify_1.estimateReadingTime)(content) : undefined),
                publishedAt: becomingPublished ? new Date() : undefined,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.researchPaper.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Research paper not found.');
        await this.prisma.researchPaper.delete({ where: { id } });
        return { id };
    }
    async uniqueSlug(source, excludeId) {
        const base = (0, slugify_1.slugify)(source);
        let candidate = base;
        let suffix = 1;
        while (await this.prisma.researchPaper.findFirst({
            where: {
                slug: candidate,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        })) {
            suffix += 1;
            candidate = `${base}-${suffix}`;
        }
        if (!candidate)
            throw new common_1.ConflictException('Could not generate a slug for this paper.');
        return candidate;
    }
    toPublicSummary(paper) {
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
    toPublicDetail(paper) {
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
    toLockedDetail(paper, discountPercent) {
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
};
exports.ResearchService = ResearchService;
exports.ResearchService = ResearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        membership_service_1.MembershipService])
], ResearchService);
//# sourceMappingURL=research.service.js.map