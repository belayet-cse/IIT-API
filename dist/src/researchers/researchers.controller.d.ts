import { ApplicationStatus } from '@prisma/client';
import { ResearchersService } from './researchers.service';
import { CreateResearcherApplicationDto } from './dto/create-researcher-application.dto';
import { RejectResearcherApplicationDto } from './dto/reject-researcher-application.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
export declare class ResearchersController {
    private readonly researchersService;
    constructor(researchersService: ResearchersService);
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
    myApplication(user: AuthenticatedUser): Promise<{
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
    approveApplication(id: string, user: AuthenticatedUser): Promise<{
        success: boolean;
    }>;
    rejectApplication(id: string, dto: RejectResearcherApplicationDto, user: AuthenticatedUser): Promise<{
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
