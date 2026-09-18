import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
    }[]>;
    create(dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    reorder(dto: ReorderCategoriesDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
    }[]>;
}
