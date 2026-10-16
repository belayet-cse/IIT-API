import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, Certification, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { initialsFromName } from '../common/utils/initials';
import { generateTempPassword } from '../common/utils/temp-password';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateHonoraryDto } from './dto/create-honorary.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';
import { UpdatePrivilegesDto } from './dto/update-privileges.dto';
import { UpdateDefaultsDto } from './dto/update-defaults.dto';

const DEFAULTS_ID = 'default';

@Injectable()
export class AlumniService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  async stats() {
    const [registeredAlumni, certifiedAlumni, countries] = await Promise.all([
      this.prisma.alumniProfile.count(),
      this.prisma.alumniProfile.count({ where: { certification: { not: null } } }),
      this.prisma.alumniProfile.findMany({
        where: { country: { not: null } },
        distinct: ['country'],
        select: { country: true },
      }),
    ]);

    return { registeredAlumni, certifiedAlumni, countries: countries.length };
  }

  async preview(limit = 4) {
    const profiles = await this.prisma.alumniProfile.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map((p) => ({
      initials: initialsFromName(p.name),
      name: p.name,
      role: p.designation,
      org: p.organization,
    }));
  }

  async directory(query: { search?: string; certification?: string; country?: string }) {
    const where: Prisma.AlumniProfileWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { organization: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.certification) where.certification = query.certification as Certification;
    if (query.country) where.country = query.country;

    const profiles = await this.prisma.alumniProfile.findMany({ where, orderBy: { createdAt: 'desc' } });
    return profiles.map((p) => ({
      initials: initialsFromName(p.name),
      name: p.name,
      role: p.designation,
      org: p.batch ? `${p.organization} · Batch ${p.batch}` : p.organization,
      badgeVariant: p.type === 'HONORARY' ? ('honorary' as const) : ('verified' as const),
      avatarColor: p.avatarColor ?? undefined,
      country: p.country ?? undefined,
      certification: p.certification ?? undefined,
      contact: { email: p.email, phone: p.phone ?? undefined },
    }));
  }

  async createApplication(dto: CreateApplicationDto, proofFileUrl?: string) {
    const pending = await this.prisma.alumniApplication.findFirst({
      where: { email: dto.email, status: ApplicationStatus.PENDING },
    });
    if (pending) {
      throw new ConflictException('You already have a pending application submitted with this email.');
    }

    return this.prisma.alumniApplication.create({ data: { ...dto, proofFileUrl } });
  }

  async myApplication(email: string) {
    const application = await this.prisma.alumniApplication.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
    if (!application) return null;

    return {
      id: application.id,
      status: application.status,
      appliedAt: application.createdAt,
      rejectionReason: application.rejectionReason ?? undefined,
    };
  }

  // ── Admin: applications ─────────────────────────────────────────────────

  async listApplications(status?: ApplicationStatus) {
    const applications = await this.prisma.alumniApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      id: a.id,
      initials: initialsFromName(a.fullName),
      name: a.fullName,
      email: a.email,
      org: a.organization,
      cert: `${a.certification} · ${a.yearCompleted}`,
      applied: a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      proofFileUrl: a.proofFileUrl ?? undefined,
      status: a.status,
    }));
  }

  async approveApplication(id: string, adminUserId: string) {
    const application = await this.prisma.alumniApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found.');
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('This application has already been reviewed.');
    }

    const linkedUser = await this.prisma.user.findUnique({ where: { email: application.email } });

    // Array-form $transaction can't let a later item depend on an id produced
    // by an earlier one, so when there's no existing account to link, the
    // interactive (callback) form is required here to create the User and
    // then use its id for the AlumniProfile in the same transaction. Without
    // this, an approved applicant who never separately registered would have
    // no way to ever log in — the real gap this fixes. No welcome email is
    // sent (matches the product decision for bulk imports to stay silent);
    // the person activates via the existing /forgot-password flow.
    const profile = await this.prisma.$transaction(async (tx) => {
      let userId = linkedUser?.id;

      if (!linkedUser) {
        const tempPassword = generateTempPassword();
        const passwordHash = await argon2.hash(tempPassword);
        const created = await tx.user.create({
          data: {
            name: application.fullName,
            email: application.email,
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

      const createdProfile = await tx.alumniProfile.create({
        data: {
          applicationId: application.id,
          userId,
          name: application.fullName,
          email: application.email,
          phone: application.phone,
          linkedin: application.linkedin,
          designation: application.designation,
          organization: application.organization,
          certification: application.certification,
          batch: application.yearCompleted,
          type: 'AUTOMATIC',
        },
      });

      await tx.alumniApplication.update({
        where: { id },
        data: { status: ApplicationStatus.APPROVED, reviewedAt: new Date(), reviewedByUserId: adminUserId },
      });

      return createdProfile;
    });

    return profile;
  }

  async rejectApplication(id: string, adminUserId: string, reason?: string) {
    const application = await this.prisma.alumniApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found.');
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('This application has already been reviewed.');
    }

    return this.prisma.alumniApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
        rejectionReason: reason,
      },
    });
  }

  // ── Admin: directory ─────────────────────────────────────────────────────

  async adminDirectory() {
    const profiles = await this.prisma.alumniProfile.findMany({ orderBy: { createdAt: 'desc' } });
    return profiles.map((p) => ({
      id: p.id,
      initials: initialsFromName(p.name),
      avatarColor: p.avatarColor ?? undefined,
      name: p.name,
      email: p.email,
      org: p.organization,
      type: p.type === 'HONORARY' ? ('honorary' as const) : ('verified' as const),
      typeLabel: p.type === 'HONORARY' ? 'Honorary' : 'Automatic',
      batch: p.batch ?? '—',
      status: 'verified' as const,
    }));
  }

  async updateAlumni(id: string, dto: UpdateAlumniDto) {
    const profile = await this.prisma.alumniProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Alumni profile not found.');
    return this.prisma.alumniProfile.update({ where: { id }, data: dto });
  }

  async createHonorary(dto: CreateHonoraryDto, photoUrl?: string) {
    const existing = await this.prisma.alumniProfile.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An alumni profile with this email already exists.');

    const linkedUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

    const [profile] = await this.prisma.$transaction([
      this.prisma.alumniProfile.create({
        data: {
          userId: linkedUser?.id,
          name: dto.name,
          email: dto.email,
          designation: dto.designation,
          organization: dto.organization,
          bio: dto.bio,
          photoUrl,
          type: 'HONORARY',
          certDiscountPercent: 100,
        },
      }),
      ...(linkedUser
        ? [this.prisma.user.update({ where: { id: linkedUser.id }, data: { role: 'ALUMNI' as const } })]
        : []),
    ]);

    return profile;
  }

  // ── Admin: privileges ────────────────────────────────────────────────────

  async privilegesList(search?: string) {
    const where: Prisma.AlumniProfileWhereInput = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { organization: { contains: search, mode: 'insensitive' } }] }
      : {};

    const profiles = await this.prisma.alumniProfile.findMany({ where, orderBy: { createdAt: 'desc' } });
    return profiles.map((p) => ({
      id: p.id,
      initials: initialsFromName(p.name),
      avatarColor: p.avatarColor ?? undefined,
      name: p.name,
      sub: p.type === 'HONORARY' ? 'Honorary member' : 'Automatic member',
      certDiscountPercent: p.certDiscountPercent,
      freeCertifications: p.freeCertifications,
      blogAccess: p.blogAccess,
      forumAccess: p.forumAccess,
    }));
  }

  async updatePrivileges(id: string, dto: UpdatePrivilegesDto) {
    const profile = await this.prisma.alumniProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Alumni profile not found.');
    return this.prisma.alumniProfile.update({ where: { id }, data: dto });
  }

  async getDefaults() {
    return this.prisma.alumniPrivilegeDefaults.upsert({
      where: { id: DEFAULTS_ID },
      update: {},
      create: { id: DEFAULTS_ID },
    });
  }

  async updateDefaults(dto: UpdateDefaultsDto) {
    return this.prisma.alumniPrivilegeDefaults.upsert({
      where: { id: DEFAULTS_ID },
      update: dto,
      create: { id: DEFAULTS_ID, ...dto },
    });
  }
}
