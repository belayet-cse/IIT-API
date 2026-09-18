import { MembershipTier } from '@prisma/client';
import { MembershipService } from './membership.service';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { ExpressInterestDto } from './dto/express-interest.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
export declare class MembershipController {
    private readonly membershipService;
    constructor(membershipService: MembershipService);
    getPlans(): Promise<{
        updatedAt: Date;
        displayName: string;
        priceBdt: number;
        priceUsd: number;
        discountPercent: number;
        tier: import("@prisma/client").$Enums.MembershipTier;
    }[]>;
    calculatePrice(user: AuthenticatedUser, dto: CalculatePriceDto): Promise<{
        originalPrice: number;
        discountPercent: number;
        discountAmount: number;
        finalPrice: number;
    }>;
    expressInterest(user: AuthenticatedUser, dto: ExpressInterestDto): Promise<{
        desiredMembershipTier: import("@prisma/client").$Enums.MembershipTier | null;
    }>;
    updatePlan(tier: MembershipTier, dto: UpdateMembershipPlanDto): Promise<{
        updatedAt: Date;
        displayName: string;
        priceBdt: number;
        priceUsd: number;
        discountPercent: number;
        tier: import("@prisma/client").$Enums.MembershipTier;
    }>;
    runExpiryCheck(): Promise<{
        remindersSent: number;
        downgraded: number;
    }>;
}
