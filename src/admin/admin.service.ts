import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [
      totalBlogs,
      publishedBlogs,
      totalUsers,
      totalAlumni,
      pendingApplications,
      recentBlogs,
    ] = await Promise.all([
      this.prisma.blog.count(),
      this.prisma.blog.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.user.count(),
      this.prisma.alumniProfile.count(),
      this.prisma.alumniApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalBlogs,
      publishedBlogs,
      totalUsers,
      totalAlumni,
      pendingApplications,
      recentBlogs,
    };
  }
}
