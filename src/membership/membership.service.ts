import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { ExpressInterestDto } from './dto/express-interest.dto';

const TIER_ORDER = { BASIC: 0, PRO: 1, ELITE: 2 } as const;
const REMINDER_WINDOW_DAYS = 7;

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async getPlans() {
    const plans = await this.prisma.membershipPlan.findMany();
    return plans.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
  }

  async updatePlan(tier: 'BASIC' | 'PRO' | 'ELITE', dto: UpdateMembershipPlanDto) {
    const existing = await this.prisma.membershipPlan.findUnique({ where: { tier } });
    if (!existing) throw new NotFoundException('Plan not found.');
    return this.prisma.membershipPlan.update({ where: { tier }, data: dto });
  }

  // REQ-011 / REQ-012: a Premium user's discount comes from their active
  // plan; an Alumni's discount comes from their profile (admin-configurable
  // per-alumni, with a global default — see AlumniPrivilegeDefaults).
  async calculatePrice(userId: string, basePrice: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { alumniProfile: true },
    });
    if (!user) throw new NotFoundException('User not found.');

    let discountPercent = 0;

    if (user.role === 'ALUMNI' && user.alumniProfile) {
      discountPercent = user.alumniProfile.certDiscountPercent;
    } else if (user.role === 'PREMIUM' && user.membershipTier) {
      const plan = await this.prisma.membershipPlan.findUnique({ where: { tier: user.membershipTier } });
      discountPercent = plan?.discountPercent ?? 0;
    }

    const discountAmount = Math.round((basePrice * discountPercent) / 100);
    const finalPrice = Math.max(0, basePrice - discountAmount);

    return { originalPrice: basePrice, discountPercent, discountAmount, finalPrice };
  }

  async expressInterest(userId: string, dto: ExpressInterestDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { desiredMembershipTier: dto.membershipTier },
    });
    return { desiredMembershipTier: user.desiredMembershipTier };
  }

  // REQ-015: no automated cron wired up yet (nothing to act on until real
  // paid Premium subscriptions exist via Phase 3 payments) — this runs on
  // admin demand for now so the logic is ready the moment it's needed.
  async runExpiryCheck() {
    const now = new Date();
    const reminderCutoff = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const expiringSoon = await this.prisma.user.findMany({
      where: {
        role: 'PREMIUM',
        membershipExpiresAt: { gt: now, lte: reminderCutoff },
      },
    });
    await Promise.all(
      expiringSoon.map((u) =>
        this.emailService.sendMembershipExpiryReminderEmail(u.email, u.membershipExpiresAt as Date),
      ),
    );

    const expired = await this.prisma.user.findMany({
      where: { role: 'PREMIUM', membershipExpiresAt: { lte: now } },
    });
    if (expired.length > 0) {
      await this.prisma.user.updateMany({
        where: { id: { in: expired.map((u) => u.id) } },
        data: { role: 'GENERAL', membershipTier: null, membershipExpiresAt: null },
      });
    }

    return { remindersSent: expiringSoon.length, downgraded: expired.length };
  }
}
