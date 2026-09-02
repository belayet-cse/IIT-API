import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { ReorderSubCategoriesDto } from './dto/reorder-subcategories.dto';

@Injectable()
export class SubCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(categoryId?: string) {
    return this.prisma.subCategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreateSubCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found.');

    const last = await this.prisma.subCategory.findFirst({
      where: { categoryId: dto.categoryId },
      orderBy: { sortOrder: 'desc' },
    });
    try {
      return await this.prisma.subCategory.create({
        data: {
          name: dto.name,
          categoryId: dto.categoryId,
          sortOrder: (last?.sortOrder ?? -1) + 1,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A subcategory with this name already exists in this category.',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    const existing = await this.prisma.subCategory.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Subcategory not found.');

    try {
      return await this.prisma.subCategory.update({
        where: { id },
        data: { name: dto.name, categoryId: dto.categoryId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A subcategory with this name already exists in this category.',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.subCategory.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Subcategory not found.');
    await this.prisma.subCategory.delete({ where: { id } });
    return { id };
  }

  async reorder(dto: ReorderSubCategoriesDto) {
    await Promise.all(
      dto.orderedIds.map((id, index) =>
        this.prisma.subCategory.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.list(dto.categoryId);
  }
}
