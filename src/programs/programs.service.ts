import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogStatus, Prisma, Program, Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MembershipService } from '../membership/membership.service';
import { slugify } from '../common/utils/slugify';
import { generateCertificatePdf } from './pdf/certificate';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────

  async list(query: { type?: string; page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 12;

    const where: Prisma.ProgramWhereInput = { status: BlogStatus.PUBLISHED };
    if (query.type)
      where.type = query.type as Prisma.EnumProgramTypeFilter['equals'];

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

  // REQ-042: access is gated on Enrollment, not price directly — even free
  // programs require an explicit Enroll action. Module titles are always a
  // public syllabus teaser; video URLs are withheld until enrolled.
  async findBySlug(slug: string, requestingUser?: AuthenticatedUser) {
    const program = await this.prisma.program.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
        modules: { orderBy: { sequence: 'asc' } },
      },
    });
    if (!program || program.status !== BlogStatus.PUBLISHED) {
      throw new NotFoundException('Program not found.');
    }

    const enrolled = await this.hasProgramAccess(program, requestingUser);

    let completedModuleIds: string[] = [];
    let completedAt: Date | null = null;
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
        completedModuleIds = enrollment.moduleCompletions.map(
          (c) => c.moduleId,
        );
        completedAt = enrollment.completedAt;
      }
    }

    let discountPercent = 0;
    let finalPriceBdt = program.priceBdt;
    let finalPriceUsd = program.priceUsd;
    if (requestingUser) {
      const bdt = await this.computeEffectivePrice(
        requestingUser,
        program,
        'BDT',
      );
      const usd = await this.computeEffectivePrice(
        requestingUser,
        program,
        'USD',
      );
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

  async enroll(user: AuthenticatedUser, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('Program not found.');

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_programId: { userId: user.userId, programId } },
    });
    if (existing) return { enrolled: true };

    const isFree = program.priceBdt === 0 && program.priceUsd === 0;
    if (!isFree) {
      const { finalPrice } = await this.computeEffectivePrice(
        user,
        program,
        'BDT',
      );
      if (finalPrice > 0) {
        throw new BadRequestException(
          "This program isn't free for you — use checkout.",
        );
      }
    }

    await this.prisma.enrollment.create({
      data: { userId: user.userId, programId },
    });
    return { enrolled: true };
  }

  // REQ-043: modules are plain video links with no embedded player, so
  // "complete" is a self-reported action, same honest-by-design spirit as
  // the rest of the payment flow. Marks completedAt on the Enrollment once
  // every module for the program has been checked off.
  async completeModule(
    user: AuthenticatedUser,
    programId: string,
    moduleId: string,
  ) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_programId: { userId: user.userId, programId } },
    });
    if (!enrollment)
      throw new BadRequestException(
        'You must be enrolled in this program first.',
      );

    const module = await this.prisma.programModule.findUnique({
      where: { id: moduleId },
    });
    if (!module || module.programId !== programId)
      throw new NotFoundException('Module not found.');

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

  async getCertificate(
    user: AuthenticatedUser,
    programId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const [enrollment, program, dbUser] = await Promise.all([
      this.prisma.enrollment.findUnique({
        where: { userId_programId: { userId: user.userId, programId } },
      }),
      this.prisma.program.findUnique({ where: { id: programId } }),
      this.prisma.user.findUnique({ where: { id: user.userId } }),
    ]);
    if (!enrollment || !program || !dbUser)
      throw new NotFoundException('Enrollment not found.');
    if (!enrollment.completedAt) {
      throw new BadRequestException(
        'Complete all modules to unlock your certificate.',
      );
    }

    const buffer = await generateCertificatePdf({
      learnerName: dbUser.name,
      programTitle: program.title,
      completedAt: enrollment.completedAt,
      referenceCode: enrollment.id.slice(0, 8).toUpperCase(),
    });

    return { buffer, filename: `${slugify(program.title)}-certificate.pdf` };
  }

  private async hasProgramAccess(
    program: { id: string; authorId: string },
    requestingUser?: AuthenticatedUser,
  ): Promise<boolean> {
    if (!requestingUser) return false;
    if (requestingUser.role === Role.ADMIN) return true;
    if (requestingUser.userId === program.authorId) return true;

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

  // REQ-013 / REQ-044: alumni freeCertifications override and per-tier
  // "free for Basic/Pro/Elite" flags both take priority over the normal
  // percentage discount engine — either zeroes the price outright.
  async computeEffectivePrice(
    user: AuthenticatedUser,
    program: Program,
    currency: 'BDT' | 'USD',
  ) {
    const basePrice = currency === 'BDT' ? program.priceBdt : program.priceUsd;

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { alumniProfile: true },
    });
    if (!dbUser) throw new NotFoundException('User not found.');

    if (dbUser.role === 'ALUMNI' && dbUser.alumniProfile) {
      const fc = dbUser.alumniProfile.freeCertifications;
      if (fc === 'all' || fc === program.slug) {
        return { basePrice, discountPercent: 100, finalPrice: 0 };
      }
    }

    if (dbUser.role === 'PREMIUM' && dbUser.membershipTier) {
      const tierFree =
        (dbUser.membershipTier === 'BASIC' && program.freeForBasic) ||
        (dbUser.membershipTier === 'PRO' && program.freeForPro) ||
        (dbUser.membershipTier === 'ELITE' && program.freeForElite);
      if (tierFree) return { basePrice, discountPercent: 100, finalPrice: 0 };
    }

    const { discountPercent, finalPrice } =
      await this.membershipService.calculatePrice(user.userId, basePrice);
    return { basePrice, discountPercent, finalPrice };
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async adminList(query: {
    search?: string;
    status?: BlogStatus;
    type?: string;
  }) {
    const where: Prisma.ProgramWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.type)
      where.type = query.type as Prisma.EnumProgramTypeFilter['equals'];
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

  async adminFindById(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: { modules: { orderBy: { sequence: 'asc' } } },
    });
    if (!program) throw new NotFoundException('Program not found.');
    return program;
  }

  async create(dto: CreateProgramDto, authorId: string) {
    const slug = await this.uniqueSlug(dto.slug || dto.title);
    const status = dto.status ?? BlogStatus.DRAFT;

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
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
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

  async update(id: string, dto: UpdateProgramDto) {
    const existing = await this.prisma.program.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Program not found.');

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.uniqueSlug(dto.slug, id)
        : undefined;
    const nextStatus = dto.status ?? existing.status;
    const becomingPublished =
      nextStatus === BlogStatus.PUBLISHED && existing.publishedAt === null;

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
    } else {
      await updateProgram;
    }

    return this.adminFindById(id);
  }

  async remove(id: string) {
    const existing = await this.prisma.program.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Program not found.');
    await this.prisma.program.delete({ where: { id } });
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
      await this.prisma.program.findFirst({
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
      throw new ConflictException(
        'Could not generate a slug for this program.',
      );
    return candidate;
  }
}
