import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { MembershipService } from '../membership/membership.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
export declare class PaymentsService {
    private readonly prisma;
    private readonly emailService;
    private readonly membershipService;
    constructor(prisma: PrismaService, emailService: EmailService, membershipService: MembershipService);
    private createGatewayCheckout;
    initiateCheckout(userId: string, dto: CreateCheckoutDto): Promise<{
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
    private initiateMembershipCheckout;
    private initiateBlogCheckout;
    private initiateResearchCheckout;
    private initiateProgramCheckout;
    listPayments(status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'): Promise<{
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
    markPaid(paymentId: string, adminUserId: string, dto: MarkPaidDto): Promise<{
        success: boolean;
    }>;
    handleGatewaySuccess(tranId: string, bankTranId?: string): Promise<{
        handled: boolean;
        payment?: undefined;
    } | {
        handled: boolean;
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
    }>;
    handleGatewayFail(tranId: string): Promise<{
        handled: boolean;
        payment?: undefined;
    } | {
        handled: boolean;
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
    }>;
    handleGatewayCancel(tranId: string): Promise<{
        handled: boolean;
        payment?: undefined;
    } | {
        handled: boolean;
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
    }>;
    private grantPayment;
    private markMembershipPaid;
    private markBlogPaid;
    private markResearchPaid;
    private markProgramPaid;
    getSuggestedCurrency(countryCode?: string): {
        currency: string;
    };
}
