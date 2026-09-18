import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ReorderPartnersDto } from './dto/reorder-partners.dto';
export declare class PartnersController {
    private readonly partnersService;
    constructor(partnersService: PartnersService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        logoUrl: string;
        websiteUrl: string | null;
    }[]>;
    create(dto: CreatePartnerDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        logoUrl: string;
        websiteUrl: string | null;
    }>;
    reorder(dto: ReorderPartnersDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        logoUrl: string;
        websiteUrl: string | null;
    }[]>;
    update(id: string, dto: UpdatePartnerDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        logoUrl: string;
        websiteUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
