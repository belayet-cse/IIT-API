import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { MembershipService } from '../membership/membership.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';

const MEMBERSHIP_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
const NOT_LIVE_MESSAGE =
  "Online payment isn't live yet — we've recorded your order and will follow up to complete payment.";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly membershipService: MembershipService,
  ) {}

  // No SSLCommerz/Stripe credentials exist yet, so this only records purchase
  // intent — it does not move money. Once real credentials are added, this is
  // the one place that needs to grow a real gateway call (see the `gateway`
  // field left null below); the rest of the flow (Payment record, admin
  // reconciliation, entitlement grant) is already real and in production use.
  async initiateCheckout(userId: string, dto: CreateCheckoutDto) {
    if (dto.type === 'BLOG') return this.initiateBlogCheckout(userId, dto);
    return this.initiateMembershipCheckout(userId, dto);
  }

  private async initiateMembershipCheckout(
    userId: string,
    dto: CreateCheckoutDto,
  ) {
    if (!dto.membershipTier)
      throw new BadRequestException('membershipTier is required.');
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { tier: dto.membershipTier },
    });
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
      message: `${NOT_LIVE_MESSAGE} We'll activate your Premium benefits once it clears.`,
    };
  }

  // REQ-083: a post's own priceBdt/priceUsd is the checkout amount, discounted
  // by the same Premium/Alumni engine used for membership content.
  private async initiateBlogCheckout(userId: string, dto: CreateCheckoutDto) {
    if (!dto.blogId) throw new BadRequestException('blogId is required.');
    const blog = await this.prisma.blog.findUnique({
      where: { id: dto.blogId },
    });
    if (!blog) throw new NotFoundException('Blog post not found.');
    if (blog.priceBdt === 0 && blog.priceUsd === 0) {
      throw new BadRequestException('This post is free — no checkout needed.');
    }

    const basePrice = dto.currency === 'BDT' ? blog.priceBdt : blog.priceUsd;
    const { discountPercent, finalPrice } =
      await this.membershipService.calculatePrice(userId, basePrice);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: dto.type,
        blogId: dto.blogId,
        currency: dto.currency,
        amount: basePrice,
        discountPercent,
        status: 'PENDING',
      },
    });

    return {
      payment,
      checkoutUrl: null,
      live: false,
      finalPrice,
      message: `${NOT_LIVE_MESSAGE} We'll unlock "${blog.title}" for you once it clears.`,
    };
  }

  async listPayments(status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED') {
    const payments = await this.prisma.payment.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        blog: { select: { title: true } },
      },
    });

    return payments.map((p) => ({
      id: p.id,
      userName: p.user.name,
      userEmail: p.user.email,
      type: p.type,
      membershipTier: p.membershipTier,
      blogTitle: p.blog?.title ?? null,
      currency: p.currency,
      amount: p.amount,
      discountPercent: p.discountPercent,
      gateway: p.gateway,
      status: p.status,
      note: p.note,
      createdAt: p.createdAt,
    }));
  }

  async markPaid(paymentId: string, adminUserId: string, dto: MarkPaidDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found.');
    if (payment.status !== 'PENDING') {
      throw new ConflictException('This payment has already been processed.');
    }

    if (payment.type === 'BLOG')
      return this.markBlogPaid(payment, adminUserId, dto);
    return this.markMembershipPaid(payment, adminUserId, dto);
  }

  private async markMembershipPaid(
    payment: { id: string; userId: string; membershipTier: string | null },
    adminUserId: string,
    dto: MarkPaidDto,
  ) {
    if (!payment.membershipTier)
      throw new BadRequestException('Unsupported payment type.');
    const membershipTier = payment.membershipTier as 'BASIC' | 'PRO' | 'ELITE';
    const expiresAt = new Date(Date.now() + MEMBERSHIP_DURATION_MS);

    const [, user] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
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
          membershipTier,
          membershipExpiresAt: expiresAt,
          desiredMembershipTier: null,
        },
      }),
    ]);

    await this.emailService.sendMembershipActivatedEmail(
      user.email,
      membershipTier,
      expiresAt,
    );
    return { success: true };
  }

  private async markBlogPaid(
    payment: { id: string; userId: string; blogId: string | null },
    adminUserId: string,
    dto: MarkPaidDto,
  ) {
    if (!payment.blogId)
      throw new BadRequestException('Unsupported payment type.');

    const [updated, blog, user] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gateway: 'MANUAL',
          processedByUserId: adminUserId,
          note: dto.note,
        },
      }),
      this.prisma.blog.findUniqueOrThrow({ where: { id: payment.blogId } }),
      this.prisma.user.findUniqueOrThrow({ where: { id: payment.userId } }),
    ]);
    void updated;

    await this.emailService.sendBlogUnlockedEmail(
      user.email,
      blog.title,
      blog.slug,
    );
    return { success: true };
  }

  getSuggestedCurrency(countryCode?: string) {
    return { currency: countryCode?.toUpperCase() === 'BD' ? 'BDT' : 'USD' };
  }
}
