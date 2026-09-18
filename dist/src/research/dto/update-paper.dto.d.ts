import { BlogStatus, Certification } from '@prisma/client';
export declare class UpdatePaperDto {
    title?: string;
    slug?: string;
    abstract?: string;
    content?: string;
    featuredImage?: string;
    category?: string;
    tags?: string[];
    status?: BlogStatus;
    priceBdt?: number;
    priceUsd?: number;
    certification?: Certification;
    readingTime?: number;
}
