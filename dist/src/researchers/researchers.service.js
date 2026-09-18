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
exports.ResearchersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const temp_password_1 = require("../common/utils/temp-password");
const initials_1 = require("../common/utils/initials");
let ResearchersService = class ResearchersService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createApplication(dto) {
        const pending = await this.prisma.researcherApplication.findFirst({
            where: { email: dto.email, status: client_1.ApplicationStatus.PENDING },
        });
        if (pending) {
            throw new common_1.ConflictException('You already have a pending application submitted with this email.');
        }
        return this.prisma.researcherApplication.create({
            data: {
                name: dto.name,
                email: dto.email,
                organization: dto.organization,
                currentRole: dto.currentRole,
                certifications: dto.certifications ?? [],
                expertiseAreas: dto.expertiseAreas ?? [],
                bio: dto.bio,
                linkedinUrl: dto.linkedinUrl,
            },
        });
    }
    async myApplication(email) {
        const application = await this.prisma.researcherApplication.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' },
        });
        if (!application)
            return null;
        return {
            id: application.id,
            status: application.status,
            appliedAt: application.createdAt,
            reviewNote: application.reviewNote ?? undefined,
        };
    }
    async listApplications(status) {
        const applications = await this.prisma.researcherApplication.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return applications.map((a) => ({
            id: a.id,
            initials: (0, initials_1.initialsFromName)(a.name),
            name: a.name,
            email: a.email,
            organization: a.organization,
            currentRole: a.currentRole,
            certifications: a.certifications,
            expertiseAreas: a.expertiseAreas,
            bio: a.bio,
            linkedinUrl: a.linkedinUrl ?? undefined,
            applied: a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: a.status,
        }));
    }
    async approveApplication(id, adminUserId) {
        const application = await this.prisma.researcherApplication.findUnique({ where: { id } });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        if (application.status !== client_1.ApplicationStatus.PENDING) {
            throw new common_1.ConflictException('This application has already been reviewed.');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: application.email } });
        if (existingUser) {
            await this.prisma.$transaction([
                this.prisma.user.update({ where: { id: existingUser.id }, data: { role: 'RESEARCHER' } }),
                this.prisma.researcherApplication.update({
                    where: { id },
                    data: { status: client_1.ApplicationStatus.APPROVED, reviewedAt: new Date(), reviewedByUserId: adminUserId },
                }),
            ]);
            await this.emailService.sendResearcherApprovedEmail(application.email);
        }
        else {
            const tempPassword = (0, temp_password_1.generateTempPassword)();
            const passwordHash = await argon2.hash(tempPassword);
            await this.prisma.$transaction([
                this.prisma.user.create({
                    data: {
                        name: application.name,
                        email: application.email,
                        organization: application.organization,
                        passwordHash,
                        role: 'RESEARCHER',
                        mustChangePassword: true,
                        emailVerified: true,
                    },
                }),
                this.prisma.researcherApplication.update({
                    where: { id },
                    data: { status: client_1.ApplicationStatus.APPROVED, reviewedAt: new Date(), reviewedByUserId: adminUserId },
                }),
            ]);
            await this.emailService.sendWelcomeCredentialsEmail(application.email, {
                tempPassword,
                roleLabel: 'Researcher',
            });
        }
        return { success: true };
    }
    async rejectApplication(id, adminUserId, reviewNote) {
        const application = await this.prisma.researcherApplication.findUnique({ where: { id } });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        if (application.status !== client_1.ApplicationStatus.PENDING) {
            throw new common_1.ConflictException('This application has already been reviewed.');
        }
        return this.prisma.researcherApplication.update({
            where: { id },
            data: {
                status: client_1.ApplicationStatus.REJECTED,
                reviewedAt: new Date(),
                reviewedByUserId: adminUserId,
                reviewNote,
            },
        });
    }
};
exports.ResearchersService = ResearchersService;
exports.ResearchersService = ResearchersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], ResearchersService);
//# sourceMappingURL=researchers.service.js.map