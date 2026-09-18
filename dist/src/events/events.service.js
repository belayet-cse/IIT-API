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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const slugify_1 = require("../common/utils/slugify");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 12;
        const where = { status: client_1.BlogStatus.PUBLISHED };
        if (query.when === 'upcoming')
            where.startAt = { gte: new Date() };
        if (query.when === 'past')
            where.startAt = { lt: new Date() };
        if (query.featured)
            where.featured = true;
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
    async findBySlug(slug) {
        const event = await this.prisma.event.findUnique({
            where: { slug },
            include: { author: { select: { name: true } } },
        });
        if (!event || event.status !== client_1.BlogStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Event not found.');
        }
        return this.toSummary(event);
    }
    toSummary(e) {
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
    async adminList(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
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
    async adminFindById(id) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Event not found.');
        return event;
    }
    async create(dto, authorId) {
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
                status: dto.status ?? client_1.BlogStatus.DRAFT,
                authorId,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.event.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Event not found.');
        const slug = dto.slug && dto.slug !== existing.slug
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
    async remove(id) {
        const existing = await this.prisma.event.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Event not found.');
        await this.prisma.event.delete({ where: { id } });
        return { id };
    }
    async uniqueSlug(source, excludeId) {
        const base = (0, slugify_1.slugify)(source);
        let candidate = base;
        let suffix = 1;
        while (await this.prisma.event.findFirst({
            where: {
                slug: candidate,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        })) {
            suffix += 1;
            candidate = `${base}-${suffix}`;
        }
        if (!candidate) {
            throw new common_1.ConflictException('Could not generate a slug for this event.');
        }
        return candidate;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map