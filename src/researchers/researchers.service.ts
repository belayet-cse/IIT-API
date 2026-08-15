import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { generateTempPassword } from '../common/utils/temp-password';
import { initialsFromName } from '../common/utils/initials';
import { CreateResearcherApplicationDto } from './dto/create-researcher-application.dto';

@Injectable()
export class ResearchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createApplication(dto: CreateResearcherApplicationDto) {
    const pending = await this.prisma.researcherApplication.findFirst({
      where: { email: dto.email, status: ApplicationStatus.PENDING },
    });
    if (pending) {
      throw new ConflictException('You already have a pending application submitted with this email.');
    }

    return this.prisma.researcherApplication.create({
      data: {
        name: dto.name,
        email: dto.email,
        organization: dto.organization,
        currentRole: dto.currentRole,
        certifications: dto.certifications ?? [],
        expertiseAreas: dto.expertiseAreas ?? [],
        bio: dto.bio,
        linkedinUrl: dto.linkedinUrl,
      },
    });
  }

  async myApplication(email: string) {
    const application = await this.prisma.researcherApplication.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
    if (!application) return null;

    return {
      id: application.id,
      status: application.status,
      appliedAt: application.createdAt,
      reviewNote: application.reviewNote ?? undefined,
    };
  }

  async listApplications(status?: ApplicationStatus) {
    const applications = await this.prisma.researcherApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      id: a.id,
      initials: initialsFromName(a.name),
      name: a.name,
      email: a.email,
      organization: a.organization,
      currentRole: a.currentRole,
      certifications: a.certifications,
      expertiseAreas: a.expertiseAreas,
      bio: a.bio,
      linkedinUrl: a.linkedinUrl ?? undefined,
      applied: a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: a.status,
    }));
  }

  async approveApplication(id: string, adminUserId: string) {
    const application = await this.prisma.researcherApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found.');
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('This application has already been reviewed.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: application.email } });

    if (existingUser) {
      await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: existingUser.id }, data: { role: 'RESEARCHER' } }),
        this.prisma.researcherApplication.update({
          where: { id },
          data: { status: ApplicationStatus.APPROVED, reviewedAt: new Date(), reviewedByUserId: adminUserId },
        }),
      ]);
      await this.emailService.sendResearcherApprovedEmail(application.email);
    } else {
      const tempPassword = generateTempPassword();
      const passwordHash = await argon2.hash(tempPassword);
      await this.prisma.$transaction([
        this.prisma.user.create({
          data: {
            name: application.name,
            email: application.email,
            organization: application.organization,
            passwordHash,
            role: 'RESEARCHER',
            mustChangePassword: true,
            emailVerified: true,
          },
        }),
        this.prisma.researcherApplication.update({
          where: { id },
          data: { status: ApplicationStatus.APPROVED, reviewedAt: new Date(), reviewedByUserId: adminUserId },
        }),
      ]);
      await this.emailService.sendWelcomeCredentialsEmail(application.email, {
        tempPassword,
        roleLabel: 'Researcher',
      });
    }

    return { success: true };
  }

  async rejectApplication(id: string, adminUserId: string, reviewNote?: string) {
    const application = await this.prisma.researcherApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found.');
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('This application has already been reviewed.');
    }

    return this.prisma.researcherApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
        reviewNote,
      },
    });
  }
}
