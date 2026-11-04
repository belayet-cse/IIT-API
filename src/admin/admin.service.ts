import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { generateTempPassword } from '../common/utils/temp-password';
import { parseCsvNameEmail, parseCsvAlumniImport } from '../common/utils/csv';
import { MemberUpgradeEmailDto } from './dto/member-upgrade-email.dto';
import { ConfirmGoLiveDto } from './dto/confirm-go-live.dto';
import { ConfirmAlumniBulkImportDto } from './dto/confirm-alumni-bulk-import.dto';

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
          return { email: entry.email, created: false };
        }
        if (dto.sendWelcomeEmail) {
          await this.emailService
            .sendWelcomeCredentialsEmail(entry.email, { tempPassword, roleLabel: 'General Member' })
            .catch(() => undefined);
        }
        return { email: entry.email, created: true };
      }),
    );

    return {
      created: results.filter((r) => r.created).length,
      skipped: results.filter((r) => !r.created).length,
    };
  }

  // ── Alumni bulk import (brand-new accounts + profiles from a legacy list) ─

  async previewAlumniBulkImport(csvText: string) {
    const rows = parseCsvAlumniImport(csvText);
    const existing = await this.prisma.alumniProfile.findMany({
      where: { email: { in: rows.map((r) => r.email) } },
      select: { email: true, userId: true },
    });
    // A profile with no linked login account is an incomplete import, not
    // "already exists" — leave it in newEntries so confirm can link it.
    const existingEmails = new Set(
      existing.filter((p) => p.userId).map((p) => p.email.toLowerCase()),
    );

    return {
      newEntries: rows.filter((r) => !existingEmails.has(r.email.toLowerCase())),
      alreadyExistsEmails: rows
        .filter((r) => existingEmails.has(r.email.toLowerCase()))
        .map((r) => r.email),
    };
  }

  async confirmAlumniBulkImport(dto: ConfirmAlumniBulkImportDto) {
    const results = await Promise.all(
      dto.entries.map((entry) =>
        this.prisma
          .$transaction(async (tx) => {
            const linkedUser = await tx.user.findUnique({ where: { email: entry.email } });
            let userId = linkedUser?.id;
            let tempPassword: string | undefined;

            if (!linkedUser) {
              tempPassword = generateTempPassword();
              const passwordHash = await argon2.hash(tempPassword);
              const created = await tx.user.create({
                data: {
                  name: entry.name,
                  email: entry.email,
                  passwordHash,
                  role: 'ALUMNI',
                  mustChangePassword: true,
                  emailVerified: true,
                },
              });
              userId = created.id;
            } else if (linkedUser.role !== 'ADMIN' && linkedUser.role !== 'RESEARCHER') {
              await tx.user.update({ where: { id: linkedUser.id }, data: { role: 'ALUMNI' } });
            }

            const orphanProfile = await tx.alumniProfile.findUnique({
              where: { email: entry.email },
            });
            if (orphanProfile?.userId) throw new Error('Profile already linked.');
            if (orphanProfile) {
              await tx.alumniProfile.update({
                where: { id: orphanProfile.id },
                data: { userId },
              });
              return { email: entry.email, tempPassword, failed: false as const };
            }

            await tx.alumniProfile.create({
              data: {
                userId,
                name: entry.name,
                email: entry.email,
                phone: entry.phone,
                linkedin: entry.linkedin,
                // Not all import sources carry these — the column is NOT
                // NULL, so fall back to empty string rather than omit.
                // Admin fills these in later via the alumni edit UI.
                designation: entry.designation ?? '',
                organization: entry.organization ?? '',
                certification: entry.certification,
                batch: entry.batch,
                country: entry.country,
                type: 'AUTOMATIC',
              },
            });

            return { email: entry.email, tempPassword, failed: false as const };
          })
          .catch(() => ({ email: entry.email, tempPassword: undefined, failed: true as const })),
      ),
    );

    if (dto.sendWelcomeEmail) {
      await Promise.all(
        results
          .filter((r) => !r.failed && r.tempPassword)
          .map((r) =>
            this.emailService
              .sendWelcomeCredentialsEmail(r.email, {
                tempPassword: r.tempPassword as string,
                roleLabel: 'Alumni Member',
              })
              .catch(() => undefined),
          ),
      );
    }

    return {
      created: results.filter((r) => !r.failed).length,
      failed: results.filter((r) => r.failed).length,
    };
  }

  // One-time "your account was upgraded" mail for members migrated from the
  // old site. Each member gets their own random temporary password (never a
  // shared one), and must change it at first login. If the mail cannot be
  // sent, the previous password is restored so nobody is locked out.
  async sendMemberUpgradeEmails(dto: MemberUpgradeEmailDto) {
    const wanted = [...new Set(dto.emails.map((e) => e.trim().toLowerCase()))];
    const users = await this.prisma.user.findMany({
      where: { role: 'GENERAL', email: { in: wanted, mode: 'insensitive' } },
      select: { id: true, email: true, passwordHash: true },
    });
    const eligibleKeys = new Set(users.map((u) => u.email.toLowerCase()));
    const notEligible = wanted.filter((e) => !eligibleKeys.has(e));

    if (dto.dryRun) {
      return { requested: wanted.length, eligible: users.length, notEligible: notEligible.length, sent: 0, failed: 0, failedEmails: [] as string[] };
    }

    let sent = 0;
    const failedEmails: string[] = [];
    for (const user of users) {
      const tempPassword = generateTempPassword();
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await argon2.hash(tempPassword), mustChangePassword: true },
      });
      try {
        await this.emailService.sendMemberUpgradeEmail(user.email, tempPassword);
        sent++;
      } catch {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: user.passwordHash, mustChangePassword: false },
        });
        failedEmails.push(user.email);
      }
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    return { requested: wanted.length, eligible: users.length, notEligible: notEligible.length, sent, failed: failedEmails.length, failedEmails };
  }
}
