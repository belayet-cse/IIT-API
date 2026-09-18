import { BlogStatus, Program } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MembershipService } from '../membership/membership.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
export declare class ProgramsService {
    private readonly prisma;
    private readonly membershipService;
    constructor(prisma: PrismaService, membershipService: MembershipService);
    list(query: {
        type?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            title: string;
            slug: string;
            code: string | null;
            type: import("@prisma/client").$Enums.ProgramType;
            overview: string;
            featuredImage: string | null;
            priceBdt: number;
            priceUsd: number;
            featured: boolean;
            author: string;
            publishedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string, requestingUser?: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        slug: string;
        code: string | null;
        type: import("@prisma/client").$Enums.ProgramType;
        overview: string;
        whoItsFor: string | null;
        examInfo: string | null;
        featuredImage: string | null;
        priceBdt: number;
        priceUsd: number;
        discountPercent: number;
        finalPriceBdt: number;
        finalPriceUsd: number;
        author: string;
        publishedAt: Date | null;
        enrolled: boolean;
        completedModuleIds: string[];
        completedAt: Date | null;
        modules: {
            id: string;
            title: string;
            videoUrl: string | null;
        }[];
    }>;
    enroll(user: AuthenticatedUser, programId: string): Promise<{
        enrolled: boolean;
    }>;
    completeModule(user: AuthenticatedUser, programId: string, moduleId: string): Promise<{
        completed: boolean;
    }>;
    getCertificate(user: AuthenticatedUser, programId: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    private hasProgramAccess;
    computeEffectivePrice(user: AuthenticatedUser, program: Program, currency: 'BDT' | 'USD'): Promise<{
        basePrice: number;
        discountPercent: number;
        finalPrice: number;
    }>;
    adminList(query: {
        search?: string;
        status?: BlogStatus;
        type?: string;
    }): Promise<{
        id: string;
        title: string;
        slug: string;
        code: string | null;
        type: import("@prisma/client").$Enums.ProgramType;
        status: import("@prisma/client").$Enums.BlogStatus;
        priceBdt: number;
        priceUsd: number;
        featured: boolean;
        enrollmentCount: number;
        author: string;
        updatedAt: Date;
    }[]>;
    adminFindById(id: string): Promise<{
        modules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sequence: number;
            programId: string;
            videoUrl: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ProgramType;
        status: import("@prisma/client").$Enums.BlogStatus;
        priceBdt: number;
        priceUsd: number;
        code: string | null;
        title: string;
        slug: string;
        featuredImage: string | null;
        authorId: string;
        publishedAt: Date | null;
        overview: string;
        whoItsFor: string | null;
        examInfo: string | null;
        freeForBasic: boolean;
        freeForPro: boolean;
        freeForElite: boolean;
        featured: boolean;
    }>;
    create(dto: CreateProgramDto, authorId: string): Promise<{
        modules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sequence: number;
            programId: string;
            videoUrl: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ProgramType;
        status: import("@prisma/client").$Enums.BlogStatus;
        priceBdt: number;
        priceUsd: number;
        code: string | null;
        title: string;
        slug: string;
        featuredImage: string | null;
        authorId: string;
        publishedAt: Date | null;
        overview: string;
        whoItsFor: string | null;
        examInfo: string | null;
        freeForBasic: boolean;
        freeForPro: boolean;
        freeForElite: boolean;
        featured: boolean;
    }>;
    update(id: string, dto: UpdateProgramDto): Promise<{
        modules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sequence: number;
            programId: string;
            videoUrl: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ProgramType;
        status: import("@prisma/client").$Enums.BlogStatus;
        priceBdt: number;
        priceUsd: number;
        code: string | null;
        title: string;
        slug: string;
        featuredImage: string | null;
        authorId: string;
        publishedAt: Date | null;
        overview: string;
        whoItsFor: string | null;
        examInfo: string | null;
        freeForBasic: boolean;
        freeForPro: boolean;
        freeForElite: boolean;
        featured: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    private uniqueSlug;
}
