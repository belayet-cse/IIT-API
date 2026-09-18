import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { ExpressInterestDto } from './dto/express-interest.dto';
export declare class MembershipService {
    private readonly prisma;
    private readonly emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    getPlans(): Promise<{
        updatedAt: Date;
        displayName: string;
        priceBdt: number;
        priceUsd: number;
        discountPercent: number;
        tier: import("@prisma/client").$Enums.MembershipTier;
    }[]>;
    updatePlan(tier: 'BASIC' | 'PRO' | 'ELITE', dto: UpdateMembershipPlanDto): Promise<{
        updatedAt: Date;
        displayName: string;
        priceBdt: number;
        priceUsd: number;
        discountPercent: number;
        tier: import("@prisma/client").$Enums.MembershipTier;
    }>;
    calculatePrice(userId: string, basePrice: number): Promise<{
        originalPrice: number;
        discountPercent: number;
        discountAmount: number;
        finalPrice: number;
    }>;
    expressInterest(userId: string, dto: ExpressInterestDto): Promise<{
        desiredMembershipTier: import("@prisma/client").$Enums.MembershipTier | null;
    }>;
    runExpiryCheck(): Promise<{
        remindersSent: number;
        downgraded: number;
    }>;
}
