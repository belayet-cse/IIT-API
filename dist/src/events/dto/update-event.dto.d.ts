import { BlogStatus, EventFormat } from '@prisma/client';
export declare class UpdateEventDto {
    title?: string;
    slug?: string;
    description?: string;
    startAt?: string;
    location?: string;
    format?: EventFormat;
    featuredImage?: string;
    featured?: boolean;
    status?: BlogStatus;
}
