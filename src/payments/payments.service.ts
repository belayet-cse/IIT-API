import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';

const MEMBERSHIP_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // No SSLCommerz/Stripe credentials exist yet, so this only records purchase
  // intent — it does not move money. Once real credentials are added, this is
  // the one place that needs to grow a real gateway call (see the `gateway`
  // field left null below); the rest of the flow (Payment record, admin
  // reconciliation, entitlement grant) is already real and in production use.
  async initiateCheckout(userId: string, dto: CreateCheckoutDto) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { tier: dto.membershipTier } });
    if (!plan) throw new NotFoundException('Plan not found.');

    const amount = dto.currency === 'BDT' ? plan.priceBdt : plan.priceUsd;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: dto.type,
        membershipTier: dto.membershipTier,
        currency: dto.currency,
        amount,
        status: 'PENDING',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { desiredMembershipTier: dto.membershipTier },
    });

    return {
      payment,
      checkoutUrl: null,
      live: false,
      message:
        "Online payment isn't live yet — we've recorded your order and will follow up to complete payment and activate your Premium benefits.",
    };
  }

  async listPayments(status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED') {
    const payments = await this.prisma.payment.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    return payments.map((p) => ({
      id: p.id,
      userName: p.user.name,
      userEmail: p.user.email,
      type: p.type,
      membershipTier: p.membershipTier,
      currency: p.currency,
      amount: p.amount,
      gateway: p.gateway,
      status: p.status,
      note: p.note,
      createdAt: p.createdAt,
    }));
  }

  async markPaid(paymentId: string, adminUserId: string, dto: MarkPaidDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found.');
    if (payment.status !== 'PENDING') {
      throw new ConflictException('This payment has already been processed.');
    }
    if (payment.type !== 'MEMBERSHIP' || !payment.membershipTier) {
      throw new BadRequestException('Unsupported payment type.');
    }

    const expiresAt = new Date(Date.now() + MEMBERSHIP_DURATION_MS);

    const [, user] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          gateway: 'MANUAL',
          processedByUserId: adminUserId,
          note: dto.note,
        },
      }),
      this.prisma.user.update({
        where: { id: payment.userId },
        data: {
          role: 'PREMIUM',
          membershipTier: payment.membershipTier,
          membershipExpiresAt: expiresAt,
          desiredMembershipTier: null,
        },
      }),
    ]);

    await this.emailService.sendMembershipActivatedEmail(user.email, payment.membershipTier, expiresAt);

    return { success: true };
  }

  getSuggestedCurrency(countryCode?: string) {
    return { currency: countryCode?.toUpperCase() === 'BD' ? 'BDT' : 'USD' };
  }
}
