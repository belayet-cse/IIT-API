"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const temp_password_1 = require("../common/utils/temp-password");
const csv_1 = require("../common/utils/csv");
let AdminService = class AdminService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async stats() {
        const [totalBlogs, publishedBlogs, totalUsers, totalAlumni, pendingApplications, recentBlogs,] = await Promise.all([
            this.prisma.blog.count(),
            this.prisma.blog.count({ where: { status: 'PUBLISHED' } }),
            this.prisma.user.count(),
            this.prisma.alumniProfile.count(),
            this.prisma.alumniApplication.count({ where: { status: 'PENDING' } }),
            this.prisma.blog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    views: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            totalBlogs,
            publishedBlogs,
            totalUsers,
            totalAlumni,
            pendingApplications,
            recentBlogs,
        };
    }
    async analytics() {
        const [rows, topBlogs, topResearch] = await Promise.all([
            this.prisma.$queryRaw `
        SELECT DATE_TRUNC('day', "viewedAt") AS day, COUNT(*) AS count
        FROM "content_views"
        WHERE "viewedAt" >= NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day ASC
      `,
            this.prisma.blog.findMany({
                orderBy: { views: 'desc' },
                take: 5,
                select: { title: true, slug: true, views: true },
            }),
            this.prisma.researchPaper.findMany({
                orderBy: { views: 'desc' },
                take: 5,
                select: { title: true, slug: true, views: true },
            }),
        ]);
        const countByDay = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));
        const viewsByDay = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const key = date.toISOString().slice(0, 10);
            return { date: key, count: countByDay.get(key) ?? 0 };
        });
        return { viewsByDay, topBlogs, topResearch };
    }
    async previewGoLive(csvText) {
        const rows = (0, csv_1.parseCsvNameEmail)(csvText);
        const existing = await this.prisma.user.findMany({
            where: { email: { in: rows.map((r) => r.email) } },
            select: { email: true },
        });
        const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));
        const newEntries = rows.filter((r) => !existingEmails.has(r.email));
        const alreadyExistsEmails = rows
            .filter((r) => existingEmails.has(r.email))
            .map((r) => r.email);
        return { newEntries, alreadyExistsEmails };
    }
    async confirmGoLive(dto) {
        const results = await Promise.all(dto.entries.map(async (entry) => {
            const tempPassword = (0, temp_password_1.generateTempPassword)();
            const passwordHash = await argon2.hash(tempPassword);
            try {
                await this.prisma.user.create({
                    data: {
                        name: entry.name,
                        email: entry.email,
                        passwordHash,
                        role: 'GENERAL',
                        mustChangePassword: true,
                        emailVerified: true,
                    },
                });
            }
            catch {
                return { email: entry.email, sent: false };
            }
            await this.emailService.sendWelcomeCredentialsEmail(entry.email, {
                tempPassword,
                roleLabel: 'General Member',
            });
            return { email: entry.email, sent: true };
        }));
        return {
            created: results.filter((r) => r.sent).length,
            skipped: results.filter((r) => !r.sent).length,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], AdminService);
//# sourceMappingURL=admin.service.js.map