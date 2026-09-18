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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const csv_1 = require("../common/utils/csv");
const ADMIN_USER_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    emailVerified: true,
    desiredMembershipTier: true,
    membershipTier: true,
    membershipExpiresAt: true,
    createdAt: true,
};
let UsersService = class UsersService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    adminList(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: ADMIN_USER_SELECT,
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('User not found.');
        try {
            return await this.prisma.user.update({
                where: { id },
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    address: dto.address,
                    role: dto.role,
                    emailVerified: dto.emailVerified,
                },
                select: ADMIN_USER_SELECT,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('A user with this email already exists.');
            }
            throw error;
        }
    }
    async previewAlumniCsv(csvText) {
        const csvEmails = (0, csv_1.parseCsvEmails)(csvText);
        const csvSet = new Set(csvEmails);
        const users = await this.prisma.user.findMany({
            where: { email: { in: csvEmails } },
            select: { email: true, role: true },
        });
        const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
        const matchedEmails = [];
        const alreadyAlumniEmails = [];
        const unmatchedEmails = [];
        const skippedPrivilegedEmails = [];
        for (const email of csvEmails) {
            const user = userByEmail.get(email);
            if (!user)
                unmatchedEmails.push(email);
            else if (user.role === 'ALUMNI')
                alreadyAlumniEmails.push(email);
            else if (user.role === 'ADMIN' || user.role === 'RESEARCHER')
                skippedPrivilegedEmails.push(email);
            else
                matchedEmails.push(email);
        }
        const pendingUsers = await this.prisma.user.findMany({
            where: { alumniVerificationStatus: 'PENDING' },
            select: { email: true },
        });
        const pendingNotMatchedEmails = pendingUsers
            .map((u) => u.email)
            .filter((email) => !csvSet.has(email.toLowerCase()));
        return {
            matchedEmails,
            alreadyAlumniEmails,
            unmatchedEmails,
            skippedPrivilegedEmails,
            pendingNotMatchedEmails,
        };
    }
    async confirmAlumniCsv(dto) {
        if (dto.matchedEmails.length > 0) {
            await this.prisma.user.updateMany({
                where: { email: { in: dto.matchedEmails }, role: { in: ['GENERAL', 'PREMIUM'] } },
                data: { role: 'ALUMNI', alumniVerificationStatus: 'VERIFIED' },
            });
        }
        await Promise.all([
            ...dto.matchedEmails.map((email) => this.emailService.sendAlumniVerificationResultEmail(email, true)),
            ...dto.pendingNotMatchedEmails.map((email) => this.emailService.sendAlumniVerificationResultEmail(email, false)),
        ]);
        return { activated: dto.matchedEmails.length, notified: dto.pendingNotMatchedEmails.length };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map