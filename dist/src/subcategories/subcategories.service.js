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
exports.SubCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let SubCategoriesService = class SubCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(categoryId) {
        return this.prisma.subCategory.findMany({
            where: categoryId ? { categoryId } : undefined,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async create(dto) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found.');
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('A subcategory with this name already exists in this category.');
            }
            throw error;
        }
    }
    async update(id, dto) {
        const existing = await this.prisma.subCategory.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Subcategory not found.');
        try {
            return await this.prisma.subCategory.update({
                where: { id },
                data: { name: dto.name, categoryId: dto.categoryId },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('A subcategory with this name already exists in this category.');
            }
            throw error;
        }
    }
    async remove(id) {
        const existing = await this.prisma.subCategory.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Subcategory not found.');
        await this.prisma.subCategory.delete({ where: { id } });
        return { id };
    }
    async reorder(dto) {
        await Promise.all(dto.orderedIds.map((id, index) => this.prisma.subCategory.update({
            where: { id },
            data: { sortOrder: index },
        })));
        return this.list(dto.categoryId);
    }
};
exports.SubCategoriesService = SubCategoriesService;
exports.SubCategoriesService = SubCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubCategoriesService);
//# sourceMappingURL=subcategories.service.js.map