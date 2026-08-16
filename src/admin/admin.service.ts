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

  // Content engagement over time — a real per-view log (ContentView), not a
  // derived/fabricated series, since the plain `views` counters on Blog and
  // Research have no timestamp history to chart.
  async analytics() {
    const [rows, topBlogs, topResearch] = await Promise.all([
      this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('day', "viewedAt") AS day, COUNT(*) AS count
        FROM "content_views"
        WHERE "viewedAt" >= NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.blog.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: { title: true, slug: true, views: true },
      }),
      this.prisma.researchPaper.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: { title: true, slug: true, views: true },
      }),
    ]);

    const countByDay = new Map(
      rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]),
    );
    const viewsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const key = date.toISOString().slice(0, 10);
      return { date: key, count: countByDay.get(key) ?? 0 };
    });

    return { viewsByDay, topBlogs, topResearch };
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
    const alreadyExistsEmails = rows
      .filter((r) => existingEmails.has(r.email))
      .map((r) => r.email);

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
