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
exports.PartnersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PartnersService = class PartnersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
    }
    async create(dto) {
        const last = await this.prisma.partner.findFirst({
            orderBy: { sortOrder: 'desc' },
        });
        return this.prisma.partner.create({
            data: {
                name: dto.name,
                logoUrl: dto.logoUrl,
                websiteUrl: dto.websiteUrl,
                sortOrder: (last?.sortOrder ?? -1) + 1,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.partner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Partner not found.');
        return this.prisma.partner.update({
            where: { id },
            data: {
                name: dto.name,
                logoUrl: dto.logoUrl,
                websiteUrl: dto.websiteUrl,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.partner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Partner not found.');
        await this.prisma.partner.delete({ where: { id } });
        return { id };
    }
    async reorder(dto) {
        await Promise.all(dto.orderedIds.map((id, index) => this.prisma.partner.update({
            where: { id },
            data: { sortOrder: index },
        })));
        return this.list();
    }
};
exports.PartnersService = PartnersService;
exports.PartnersService = PartnersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartnersService);
//# sourceMappingURL=partners.service.js.map