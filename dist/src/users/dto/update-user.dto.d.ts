import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: Role;
    emailVerified?: boolean;
}
