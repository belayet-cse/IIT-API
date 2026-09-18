import { MembershipTier } from '@prisma/client';
export type RegistrationType = 'GENERAL' | 'PREMIUM' | 'ALUMNI';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    organization?: string;
    registrationType?: RegistrationType;
    membershipTier?: MembershipTier;
}
