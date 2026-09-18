import { BlogStatus, ProgramType } from '@prisma/client';
import { ProgramModuleDto } from './program-module.dto';
export declare class CreateProgramDto {
    title: string;
    slug?: string;
    code?: string;
    type: ProgramType;
    overview: string;
    whoItsFor?: string;
    examInfo?: string;
    featuredImage?: string;
    priceBdt?: number;
    priceUsd?: number;
    freeForBasic?: boolean;
    freeForPro?: boolean;
    freeForElite?: boolean;
    featured?: boolean;
    status?: BlogStatus;
    modules?: ProgramModuleDto[];
}
