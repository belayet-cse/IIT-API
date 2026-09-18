import type { Response } from 'express';
import { PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    suggestedCurrency(country?: string): {
        currency: string;
    };
    sslcommerzSuccess(body: Record<string, string>, res: Response): Promise<void>;
    sslcommerzFail(tranId: string, res: Response): Promise<void>;
    sslcommerzCancel(tranId: string, res: Response): Promise<void>;
    sslcommerzIpn(body: Record<string, string>): Promise<{
        ok: boolean;
    }>;
    checkout(user: AuthenticatedUser, dto: CreateCheckoutDto): Promise<{
        checkoutUrl: string;
        live: true;
        message: string;
        payment: {
            membershipTier: import("@prisma/client").$Enums.MembershipTier | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import("@prisma/client").$Enums.PaymentType;
            status: import("@prisma/client").$Enums.PaymentStatus;
            discountPercent: number;
            blogId: string | null;
            paperId: string | null;
            programId: string | null;
            currency: import("@prisma/client").$Enums.PaymentCurrency;
            gateway: import("@prisma/client").$Enums.PaymentGateway | null;
            amount: number;
            gatewayReference: string | null;
            note: string | null;
            processedByUserId: string | null;
        };
    } | {
        payment: {
            membershipTier: import("@prisma/client").$Enums.MembershipTier | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import("@prisma/client").$Enums.PaymentType;
            status: import("@prisma/client").$Enums.PaymentStatus;
            discountPercent: number;
            blogId: string | null;
            paperId: string | null;
            programId: string | null;
            currency: import("@prisma/client").$Enums.PaymentCurrency;
            gateway: import("@prisma/client").$Enums.PaymentGateway | null;
            amount: number;
            gatewayReference: string | null;
            note: string | null;
            processedByUserId: string | null;
        };
        checkoutUrl: null;
        live: boolean;
        message: string;
    }>;
    listPayments(status?: PaymentStatus): Promise<{
        id: string;
        userName: string;
        userEmail: string;
        type: import("@prisma/client").$Enums.PaymentType;
        membershipTier: import("@prisma/client").$Enums.MembershipTier | null;
        blogTitle: string | null;
        paperTitle: string | null;
        programTitle: string | null;
        currency: import("@prisma/client").$Enums.PaymentCurrency;
        amount: number;
        discountPercent: number;
        gateway: import("@prisma/client").$Enums.PaymentGateway | null;
        status: import("@prisma/client").$Enums.PaymentStatus;
        note: string | null;
        createdAt: Date;
    }[]>;
    markPaid(id: string, dto: MarkPaidDto, user: AuthenticatedUser): Promise<{
        success: boolean;
    }>;
}
