import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { ReorderSubCategoriesDto } from './dto/reorder-subcategories.dto';
export declare class SubCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(categoryId?: string): Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }[]>;
    create(dto: CreateSubCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateSubCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    reorder(dto: ReorderSubCategoriesDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }[]>;
}
