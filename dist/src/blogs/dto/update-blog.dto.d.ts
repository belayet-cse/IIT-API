import { BlogStatus } from '@prisma/client';
export declare class UpdateBlogDto {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    category?: string;
    subCategory?: string;
    tags?: string[];
    status?: BlogStatus;
    priceBdt?: number;
    priceUsd?: number;
    readingTime?: number;
    sequence?: number;
}
