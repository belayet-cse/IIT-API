import { SubCategoriesService } from './subcategories.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { ReorderSubCategoriesDto } from './dto/reorder-subcategories.dto';
export declare class SubCategoriesController {
    private readonly subCategoriesService;
    constructor(subCategoriesService: SubCategoriesService);
    list(categoryId?: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    reorder(dto: ReorderSubCategoriesDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }[]>;
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
}
