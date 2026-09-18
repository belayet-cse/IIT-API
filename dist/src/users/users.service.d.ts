import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmAlumniCsvDto } from './dto/confirm-alumni-csv.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    adminList(query: {
        search?: string;
    }): Prisma.PrismaPromise<{
        name: string;
        email: string;
        phone: string | null;
        membershipTier: import("@prisma/client").$Enums.MembershipTier | null;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        emailVerified: boolean;
        desiredMembershipTier: import("@prisma/client").$Enums.MembershipTier | null;
        membershipExpiresAt: Date | null;
        createdAt: Date;
    }[]>;
    update(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        email: string;
        phone: string | null;
        membershipTier: import("@prisma/client").$Enums.MembershipTier | null;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        emailVerified: boolean;
        desiredMembershipTier: import("@prisma/client").$Enums.MembershipTier | null;
        membershipExpiresAt: Date | null;
        createdAt: Date;
    }>;
    previewAlumniCsv(csvText: string): Promise<{
        matchedEmails: string[];
        alreadyAlumniEmails: string[];
        unmatchedEmails: string[];
        skippedPrivilegedEmails: string[];
        pendingNotMatchedEmails: string[];
    }>;
    confirmAlumniCsv(dto: ConfirmAlumniCsvDto): Promise<{
        activated: number;
        notified: number;
    }>;
}
