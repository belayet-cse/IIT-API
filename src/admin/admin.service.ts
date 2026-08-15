import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { generateTempPassword } from '../common/utils/temp-password';
import { parseCsvNameEmail } from '../common/utils/csv';
import { ConfirmGoLiveDto } from './dto/confirm-go-live.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

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

  // ── Go-live bulk rollout (REQ-093 / REQ-095) ──────────────────────────────

  async previewGoLive(csvText: string) {
    const rows = parseCsvNameEmail(csvText);
    const existing = await this.prisma.user.findMany({
      where: { email: { in: rows.map((r) => r.email) } },
      select: { email: true },
    });
    const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));

    const newEntries = rows.filter((r) => !existingEmails.has(r.email));
    const alreadyExistsEmails = rows.filter((r) => existingEmails.has(r.email)).map((r) => r.email);

    return { newEntries, alreadyExistsEmails };
  }

  async confirmGoLive(dto: ConfirmGoLiveDto) {
    const results = await Promise.all(
      dto.entries.map(async (entry) => {
        const tempPassword = generateTempPassword();
        const passwordHash = await argon2.hash(tempPassword);
        try {
          await this.prisma.user.create({
            data: {
              name: entry.name,
              email: entry.email,
              passwordHash,
              role: 'GENERAL',
              mustChangePassword: true,
              emailVerified: true,
            },
          });
        } catch {
          // Already exists (race with another confirm call, or created since preview) — skip.
          return { email: entry.email, sent: false };
        }
        await this.emailService.sendWelcomeCredentialsEmail(entry.email, {
          tempPassword,
          roleLabel: 'General Member',
        });
        return { email: entry.email, sent: true };
      }),
    );

    return {
      created: results.filter((r) => r.sent).length,
      skipped: results.filter((r) => !r.sent).length,
    };
  }
}
