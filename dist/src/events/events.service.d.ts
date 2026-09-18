import { BlogStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: {
        when?: 'upcoming' | 'past';
        featured?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            title: string;
            slug: string;
            description: string;
            startAt: Date;
            location: string | null;
            format: import("@prisma/client").$Enums.EventFormat;
            featuredImage: string | null;
            featured: boolean;
            author: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<{
        title: string;
        slug: string;
        description: string;
        startAt: Date;
        location: string | null;
        format: import("@prisma/client").$Enums.EventFormat;
        featuredImage: string | null;
        featured: boolean;
        author: string;
    }>;
    private toSummary;
    adminList(query: {
        search?: string;
        status?: BlogStatus;
    }): Promise<{
        id: string;
        title: string;
        slug: string;
        startAt: Date;
        location: string | null;
        format: import("@prisma/client").$Enums.EventFormat;
        featured: boolean;
        status: import("@prisma/client").$Enums.BlogStatus;
        author: string;
        updatedAt: Date;
    }[]>;
    adminFindById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.BlogStatus;
        title: string;
        slug: string;
        featuredImage: string | null;
        authorId: string;
        format: import("@prisma/client").$Enums.EventFormat;
        featured: boolean;
        description: string;
        startAt: Date;
        location: string | null;
    }>;
    create(dto: CreateEventDto, authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.BlogStatus;
        title: string;
        slug: string;
        featuredImage: string | null;
        authorId: string;
        format: import("@prisma/client").$Enums.EventFormat;
        featured: boolean;
        description: string;
        startAt: Date;
        location: string | null;
    }>;
    update(id: string, dto: UpdateEventDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.BlogStatus;
        title: string;
        slug: string;
        featuredImage: string | null;
        authorId: string;
        format: import("@prisma/client").$Enums.EventFormat;
        featured: boolean;
        description: string;
        startAt: Date;
        location: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    private uniqueSlug;
}
