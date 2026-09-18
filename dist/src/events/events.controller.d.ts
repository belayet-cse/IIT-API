import { BlogStatus } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    list(when?: 'upcoming' | 'past', featured?: string, page?: string, limit?: string): Promise<{
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
    adminList(search?: string, status?: BlogStatus): Promise<{
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
    create(dto: CreateEventDto, user: AuthenticatedUser): Promise<{
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
}
