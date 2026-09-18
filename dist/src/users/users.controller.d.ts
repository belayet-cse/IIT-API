import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmAlumniCsvDto } from './dto/confirm-alumni-csv.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    adminList(search?: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    previewAlumniCsv(file?: Express.Multer.File): Promise<{
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
}
