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
exports.ProgramsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const membership_service_1 = require("../membership/membership.service");
const slugify_1 = require("../common/utils/slugify");
const certificate_1 = require("./pdf/certificate");
let ProgramsService = class ProgramsService {
    prisma;
    membershipService;
    constructor(prisma, membershipService) {
        this.prisma = prisma;
        this.membershipService = membershipService;
    }
    async list(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 12;
        const where = { status: client_1.BlogStatus.PUBLISHED };
        if (query.type)
            where.type = query.type;
        const [programs, total] = await Promise.all([
            this.prisma.program.findMany({
                where,
                orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
                include: { author: { select: { name: true } } },
            }),
            this.prisma.program.count({ where }),
        ]);
        return {
            data: programs.map((p) => ({
                title: p.title,
                slug: p.slug,
                code: p.code,
                type: p.type,
                overview: p.overview,
                featuredImage: p.featuredImage,
                priceBdt: p.priceBdt,
                priceUsd: p.priceUsd,
                featured: p.featured,
                author: p.author.name,
                publishedAt: p.publishedAt,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }
    async findBySlug(slug, requestingUser) {
        const program = await this.prisma.program.findUnique({
            where: { slug },
            include: {
                author: { select: { name: true } },
                modules: { orderBy: { sequence: 'asc' } },
            },
        });
        if (!program || program.status !== client_1.BlogStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Program not found.');
        }
        const enrolled = await this.hasProgramAccess(program, requestingUser);
        let completedModuleIds = [];
        let completedAt = null;
        if (enrolled && requestingUser) {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: {
                    userId_programId: {
                        userId: requestingUser.userId,
                        programId: program.id,
                    },
                },
                include: { moduleCompletions: true },
            });
            if (enrollment) {
                completedModuleIds = enrollment.moduleCompletions.map((c) => c.moduleId);
                completedAt = enrollment.completedAt;
            }
        }
        let discountPercent = 0;
        let finalPriceBdt = program.priceBdt;
        let finalPriceUsd = program.priceUsd;
        if (requestingUser) {
            const bdt = await this.computeEffectivePrice(requestingUser, program, 'BDT');
            const usd = await this.computeEffectivePrice(requestingUser, program, 'USD');
            discountPercent = bdt.discountPercent;
            finalPriceBdt = bdt.finalPrice;
            finalPriceUsd = usd.finalPrice;
        }
        return {
            id: program.id,
            title: program.title,
            slug: program.slug,
            code: program.code,
            type: program.type,
            overview: program.overview,
            whoItsFor: program.whoItsFor,
            examInfo: program.examInfo,
            featuredImage: program.featuredImage,
            priceBdt: program.priceBdt,
            priceUsd: program.priceUsd,
            discountPercent,
            finalPriceBdt,
            finalPriceUsd,
            author: program.author.name,
            publishedAt: program.publishedAt,
            enrolled,
            completedModuleIds,
            completedAt,
            modules: program.modules.map((m) => ({
                id: m.id,
                title: m.title,
                videoUrl: enrolled ? m.videoUrl : null,
            })),
        };
    }
    async enroll(user, programId) {
        const program = await this.prisma.program.findUnique({
            where: { id: programId },
        });
        if (!program)
            throw new common_1.NotFoundException('Program not found.');
        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_programId: { userId: user.userId, programId } },
        });
        if (existing)
            return { enrolled: true };
        const isFree = program.priceBdt === 0 && program.priceUsd === 0;
        if (!isFree) {
            const { finalPrice } = await this.computeEffectivePrice(user, program, 'BDT');
            if (finalPrice > 0) {
                throw new common_1.BadRequestException("This program isn't free for you — use checkout.");
            }
        }
        await this.prisma.enrollment.create({
            data: { userId: user.userId, programId },
        });
        return { enrolled: true };
    }
    async completeModule(user, programId, moduleId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_programId: { userId: user.userId, programId } },
        });
        if (!enrollment)
            throw new common_1.BadRequestException('You must be enrolled in this program first.');
        const module = await this.prisma.programModule.findUnique({
            where: { id: moduleId },
        });
        if (!module || module.programId !== programId)
            throw new common_1.NotFoundException('Module not found.');
        await this.prisma.moduleCompletion.upsert({
            where: {
                enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId },
            },
            create: { enrollmentId: enrollment.id, moduleId },
            update: {},
        });
        if (!enrollment.completedAt) {
            const [totalModules, completedCount] = await Promise.all([
                this.prisma.programModule.count({ where: { programId } }),
                this.prisma.moduleCompletion.count({
                    where: { enrollmentId: enrollment.id },
                }),
            ]);
            if (totalModules > 0 && completedCount >= totalModules) {
                await this.prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: { completedAt: new Date() },
                });
            }
        }
        return { completed: true };
    }
    async getCertificate(user, programId) {
        const [enrollment, program, dbUser] = await Promise.all([
            this.prisma.enrollment.findUnique({
                where: { userId_programId: { userId: user.userId, programId } },
            }),
            this.prisma.program.findUnique({ where: { id: programId } }),
            this.prisma.user.findUnique({ where: { id: user.userId } }),
        ]);
        if (!enrollment || !program || !dbUser)
            throw new common_1.NotFoundException('Enrollment not found.');
        if (!enrollment.completedAt) {
            throw new common_1.BadRequestException('Complete all modules to unlock your certificate.');
        }
        const buffer = await (0, certificate_1.generateCertificatePdf)({
            learnerName: dbUser.name,
            programTitle: program.title,
            completedAt: enrollment.completedAt,
            referenceCode: enrollment.id.slice(0, 8).toUpperCase(),
        });
        return { buffer, filename: `${(0, slugify_1.slugify)(program.title)}-certificate.pdf` };
    }
    async hasProgramAccess(program, requestingUser) {
        if (!requestingUser)
            return false;
        if (requestingUser.role === client_1.Role.ADMIN)
            return true;
        if (requestingUser.userId === program.authorId)
            return true;
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_programId: {
                    userId: requestingUser.userId,
                    programId: program.id,
                },
            },
        });
        return !!enrollment;
    }
    async computeEffectivePrice(user, program, currency) {
        const basePrice = currency === 'BDT' ? program.priceBdt : program.priceUsd;
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.userId },
            include: { alumniProfile: true },
        });
        if (!dbUser)
            throw new common_1.NotFoundException('User not found.');
        if (dbUser.role === 'ALUMNI' && dbUser.alumniProfile) {
            const fc = dbUser.alumniProfile.freeCertifications;
            if (fc === 'all' || fc === program.slug) {
                return { basePrice, discountPercent: 100, finalPrice: 0 };
            }
        }
        if (dbUser.role === 'PREMIUM' && dbUser.membershipTier) {
            const tierFree = (dbUser.membershipTier === 'BASIC' && program.freeForBasic) ||
                (dbUser.membershipTier === 'PRO' && program.freeForPro) ||
                (dbUser.membershipTier === 'ELITE' && program.freeForElite);
            if (tierFree)
                return { basePrice, discountPercent: 100, finalPrice: 0 };
        }
        const { discountPercent, finalPrice } = await this.membershipService.calculatePrice(user.userId, basePrice);
        return { basePrice, discountPercent, finalPrice };
    }
    async adminList(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.type)
            where.type = query.type;
        if (query.search) {
            where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
        }
        const programs = await this.prisma.program.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { name: true } },
                _count: { select: { enrollments: true } },
            },
        });
        return programs.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            code: p.code,
            type: p.type,
            status: p.status,
            priceBdt: p.priceBdt,
            priceUsd: p.priceUsd,
            featured: p.featured,
            enrollmentCount: p._count.enrollments,
            author: p.author.name,
            updatedAt: p.updatedAt,
        }));
    }
    async adminFindById(id) {
        const program = await this.prisma.program.findUnique({
            where: { id },
            include: { modules: { orderBy: { sequence: 'asc' } } },
        });
        if (!program)
            throw new common_1.NotFoundException('Program not found.');
        return program;
    }
    async create(dto, authorId) {
        const slug = await this.uniqueSlug(dto.slug || dto.title);
        const status = dto.status ?? client_1.BlogStatus.DRAFT;
        return this.prisma.program.create({
            data: {
                title: dto.title,
                slug,
                code: dto.code,
                type: dto.type,
                overview: dto.overview,
                whoItsFor: dto.whoItsFor,
                examInfo: dto.examInfo,
                featuredImage: dto.featuredImage,
                priceBdt: dto.priceBdt ?? 0,
                priceUsd: dto.priceUsd ?? 0,
                freeForBasic: dto.freeForBasic ?? false,
                freeForPro: dto.freeForPro ?? false,
                freeForElite: dto.freeForElite ?? false,
                featured: dto.featured ?? false,
                status,
                publishedAt: status === client_1.BlogStatus.PUBLISHED ? new Date() : null,
                authorId,
                modules: dto.modules
                    ? {
                        create: dto.modules.map((m, i) => ({
                            title: m.title,
                            videoUrl: m.videoUrl,
                            sequence: m.sequence ?? i,
                        })),
                    }
                    : undefined,
            },
            include: { modules: { orderBy: { sequence: 'asc' } } },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.program.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Program not found.');
        const slug = dto.slug && dto.slug !== existing.slug
            ? await this.uniqueSlug(dto.slug, id)
            : undefined;
        const nextStatus = dto.status ?? existing.status;
        const becomingPublished = nextStatus === client_1.BlogStatus.PUBLISHED && existing.publishedAt === null;
        const updateProgram = this.prisma.program.update({
            where: { id },
            data: {
                title: dto.title,
                slug,
                code: dto.code,
                type: dto.type,
                overview: dto.overview,
                whoItsFor: dto.whoItsFor,
                examInfo: dto.examInfo,
                featuredImage: dto.featuredImage,
                priceBdt: dto.priceBdt,
                priceUsd: dto.priceUsd,
                freeForBasic: dto.freeForBasic,
                freeForPro: dto.freeForPro,
                freeForElite: dto.freeForElite,
                featured: dto.featured,
                status: dto.status,
                publishedAt: becomingPublished ? new Date() : undefined,
            },
        });
        if (dto.modules) {
            const modules = dto.modules;
            await this.prisma.$transaction([
                updateProgram,
                this.prisma.programModule.deleteMany({ where: { programId: id } }),
                this.prisma.programModule.createMany({
                    data: modules.map((m, i) => ({
                        programId: id,
                        title: m.title,
                        videoUrl: m.videoUrl,
                        sequence: m.sequence ?? i,
                    })),
                }),
            ]);
        }
        else {
            await updateProgram;
        }
        return this.adminFindById(id);
    }
    async remove(id) {
        const existing = await this.prisma.program.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Program not found.');
        await this.prisma.program.delete({ where: { id } });
        return { id };
    }
    async uniqueSlug(source, excludeId) {
        const base = (0, slugify_1.slugify)(source);
        let candidate = base;
        let suffix = 1;
        while (await this.prisma.program.findFirst({
            where: {
                slug: candidate,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        })) {
            suffix += 1;
            candidate = `${base}-${suffix}`;
        }
        if (!candidate)
            throw new common_1.ConflictException('Could not generate a slug for this program.');
        return candidate;
    }
};
exports.ProgramsService = ProgramsService;
exports.ProgramsService = ProgramsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        membership_service_1.MembershipService])
], ProgramsService);
//# sourceMappingURL=programs.service.js.map