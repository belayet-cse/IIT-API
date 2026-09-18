import { AdminService } from './admin.service';
import { ConfirmGoLiveDto } from './dto/confirm-go-live.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    stats(): Promise<{
        totalBlogs: number;
        publishedBlogs: number;
        totalUsers: number;
        totalAlumni: number;
        pendingApplications: number;
        recentBlogs: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.BlogStatus;
            title: string;
            slug: string;
            views: number;
        }[];
    }>;
    analytics(): Promise<{
        viewsByDay: {
            date: string;
            count: number;
        }[];
        topBlogs: {
            title: string;
            slug: string;
            views: number;
        }[];
        topResearch: {
            title: string;
            slug: string;
            views: number;
        }[];
    }>;
    previewGoLive(file?: Express.Multer.File): Promise<{
        newEntries: {
            name: string;
            email: string;
        }[];
        alreadyExistsEmails: string[];
    }>;
    confirmGoLive(dto: ConfirmGoLiveDto): Promise<{
        created: number;
        skipped: number;
    }>;
}
