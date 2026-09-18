import { PrismaService } from '../database/prisma.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
export declare class ForumService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(user: AuthenticatedUser, query: {
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            title: string;
            category: string | null;
            author: string;
            authorId: string;
            pinned: boolean;
            locked: boolean;
            replyCount: number;
            views: number;
            lastActivityAt: Date;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(user: AuthenticatedUser, id: string): Promise<{
        isLiked: boolean;
        replies: {
            id: string;
            content: string;
            author: string;
            authorId: string;
            authorRole: import("@prisma/client").$Enums.Role;
            authorOrganization: string | null;
            parentPostId: string | null;
            likeCount: number;
            isLiked: boolean;
            createdAt: Date;
        }[];
        id: string;
        title: string;
        content: string;
        category: string | null;
        author: string;
        authorId: string;
        authorRole: import("@prisma/client").$Enums.Role;
        authorOrganization: string | null;
        pinned: boolean;
        locked: boolean;
        replyCount: number;
        views: number;
        likeCount: number;
        lastActivityAt: Date;
        createdAt: Date;
    }>;
    createThread(user: AuthenticatedUser, dto: CreateThreadDto): Promise<{
        id: string;
    }>;
    createReply(user: AuthenticatedUser, threadId: string, dto: CreateReplyDto): Promise<{
        id: string;
    }>;
    toggleLike(user: AuthenticatedUser, postId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    adminList(query: {
        search?: string;
        category?: string;
    }): Promise<{
        id: string;
        title: string;
        category: string | null;
        authorName: string;
        authorEmail: string;
        pinned: boolean;
        locked: boolean;
        replyCount: number;
        views: number;
        createdAt: Date;
        lastActivityAt: Date;
    }[]>;
    updateThread(id: string, dto: UpdateThreadDto): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        views: number;
        authorId: string;
        pinned: boolean;
        locked: boolean;
        replyCount: number;
        likeCount: number;
        lastActivityAt: Date;
    }>;
    removeThread(id: string): Promise<{
        id: string;
    }>;
    removePost(id: string): Promise<{
        id: string;
    }>;
    private assertAccess;
    private toSummary;
    private toDetail;
    toggleThreadLike(user: AuthenticatedUser, threadId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
}
