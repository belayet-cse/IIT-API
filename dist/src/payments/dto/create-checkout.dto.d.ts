import { MembershipTier, PaymentCurrency, PaymentType } from '@prisma/client';
export declare class CreateCheckoutDto {
    type: PaymentType;
    membershipTier?: MembershipTier;
    blogId?: string;
    paperId?: string;
    programId?: string;
    currency: PaymentCurrency;
}
