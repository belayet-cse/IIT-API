import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateResearcherApplicationDto } from './dto/create-researcher-application.dto';
export declare class ResearchersService {
    private readonly prisma;
    private readonly emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    createApplication(dto: CreateResearcherApplicationDto): Promise<{
        name: string;
        email: string;
        organization: string;
        id: string;
        createdAt: Date;
        bio: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        reviewedAt: Date | null;
        reviewedByUserId: string | null;
        currentRole: string;
        certifications: string[];
        expertiseAreas: string[];
        linkedinUrl: string | null;
        reviewNote: string | null;
    }>;
    myApplication(email: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        appliedAt: Date;
        reviewNote: string | undefined;
    } | null>;
    listApplications(status?: ApplicationStatus): Promise<{
        id: string;
        initials: string;
        name: string;
        email: string;
        organization: string;
        currentRole: string;
        certifications: string[];
        expertiseAreas: string[];
        bio: string;
        linkedinUrl: string | undefined;
        applied: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    }[]>;
    approveApplication(id: string, adminUserId: string): Promise<{
        success: boolean;
    }>;
    rejectApplication(id: string, adminUserId: string, reviewNote?: string): Promise<{
        name: string;
        email: string;
        organization: string;
        id: string;
        createdAt: Date;
        bio: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        reviewedAt: Date | null;
        reviewedByUserId: string | null;
        currentRole: string;
        certifications: string[];
        expertiseAreas: string[];
        linkedinUrl: string | null;
        reviewNote: string | null;
    }>;
}
