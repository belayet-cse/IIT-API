import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { parseCsvEmails } from '../common/utils/csv';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmAlumniCsvDto } from './dto/confirm-alumni-csv.dto';

const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  emailVerified: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  adminList(query: { search?: string }) {
    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: ADMIN_USER_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found.');

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          role: dto.role,
          emailVerified: dto.emailVerified,
        },
        select: ADMIN_USER_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw error;
    }
  }

  // ── Alumni CSV verification (REQ-002 / REQ-071 / REQ-093) ────────────────

  async previewAlumniCsv(csvText: string) {
    const csvEmails = parseCsvEmails(csvText);
    const csvSet = new Set(csvEmails);

    const users = await this.prisma.user.findMany({
      where: { email: { in: csvEmails } },
      select: { email: true, role: true },
    });
    const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    const matchedEmails: string[] = [];
    const alreadyAlumniEmails: string[] = [];
    const unmatchedEmails: string[] = [];
    const skippedPrivilegedEmails: string[] = [];

    for (const email of csvEmails) {
      const user = userByEmail.get(email);
      if (!user) unmatchedEmails.push(email);
      else if (user.role === 'ALUMNI') alreadyAlumniEmails.push(email);
      // Never let a bulk CSV import touch ADMIN/RESEARCHER accounts.
      else if (user.role === 'ADMIN' || user.role === 'RESEARCHER') skippedPrivilegedEmails.push(email);
      else matchedEmails.push(email);
    }

    const pendingUsers = await this.prisma.user.findMany({
      where: { alumniVerificationStatus: 'PENDING' },
      select: { email: true },
    });
    const pendingNotMatchedEmails = pendingUsers
      .map((u) => u.email)
      .filter((email) => !csvSet.has(email.toLowerCase()));

    return {
      matchedEmails,
      alreadyAlumniEmails,
      unmatchedEmails,
      skippedPrivilegedEmails,
      pendingNotMatchedEmails,
    };
  }

  async confirmAlumniCsv(dto: ConfirmAlumniCsvDto) {
    if (dto.matchedEmails.length > 0) {
      // Re-check role at confirm time too — never let this path touch
      // ADMIN/RESEARCHER accounts, even if the client-echoed list did.
      await this.prisma.user.updateMany({
        where: { email: { in: dto.matchedEmails }, role: { in: ['GENERAL', 'PREMIUM'] } },
        data: { role: 'ALUMNI', alumniVerificationStatus: 'VERIFIED' },
      });
    }

    await Promise.all([
      ...dto.matchedEmails.map((email) =>
        this.emailService.sendAlumniVerificationResultEmail(email, true),
      ),
      ...dto.pendingNotMatchedEmails.map((email) =>
        this.emailService.sendAlumniVerificationResultEmail(email, false),
      ),
    ]);

    return { activated: dto.matchedEmails.length, notified: dto.pendingNotMatchedEmails.length };
  }
}
