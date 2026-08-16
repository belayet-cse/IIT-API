import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PaymentGateway } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { MembershipService } from '../membership/membership.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import {
  initiateSslcommerzPayment,
  isSslcommerzConfigured,
} from './sslcommerz';

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

  // If SSLCommerz credentials are configured, redirect to a real hosted
  // checkout; otherwise fall back to the manual-recording flow (Payment row
  // stays PENDING until an admin reconciles it out of band).
  private async createGatewayCheckout(
    userId: string,
    paymentId: string,
    finalPrice: number,
    currency: string,
    productName: string,
  ): Promise<{ checkoutUrl: string; live: true; message: string } | null> {
    if (!isSslcommerzConfigured() || finalPrice <= 0) return null;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) return null;

    // SSLCommerz caps tran_id at 30 chars — payment.id (a UUID) is too long,
    // so a short reference is generated and stored in gatewayReference,
    // which the callback routes then look the payment back up by.
    const shortTranId = randomBytes(10).toString('hex');
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { gatewayReference: shortTranId },
    });

    try {
      const checkoutUrl = await initiateSslcommerzPayment({
        tranId: shortTranId,
        totalAmount: finalPrice,
        currency,
        successUrl: `${apiBaseUrl}/api/payments/sslcommerz/success`,
        failUrl: `${apiBaseUrl}/api/payments/sslcommerz/fail`,
        cancelUrl: `${apiBaseUrl}/api/payments/sslcommerz/cancel`,
        ipnUrl: `${apiBaseUrl}/api/payments/sslcommerz/ipn`,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || '01700000000',
        customerAddress: user.address || 'N/A',
        customerCity: 'Dhaka',
        productName,
      });
      return {
        checkoutUrl,
        live: true,
        message: 'Redirecting to secure payment…',
      };
    } catch {
      return null;
    }
  }

  async initiateCheckout(userId: string, dto: CreateCheckoutDto) {
    if (dto.type === 'BLOG') return this.initiateBlogCheckout(userId, dto);
    if (dto.type === 'RESEARCH')
      return this.initiateResearchCheckout(userId, dto);
    if (dto.type === 'PROGRAM')
      return this.initiateProgramCheckout(userId, dto);
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

    const gateway = await this.createGatewayCheckout(
      userId,
      payment.id,
      amount,
      dto.currency,
      `IIT ${dto.membershipTier} Membership`,
    );
    if (gateway) return { payment, ...gateway };

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

    const gateway = await this.createGatewayCheckout(
      userId,
      payment.id,
      finalPrice,
      dto.currency,
      blog.title,
    );
    if (gateway) return { payment, finalPrice, ...gateway };

    return {
      payment,
      checkoutUrl: null,
      live: false,
      finalPrice,
      message: `${NOT_LIVE_MESSAGE} We'll unlock "${blog.title}" for you once it clears.`,
    };
  }

  // REQ-081: a paper's own priceBdt/priceUsd is the checkout amount,
  // discounted by the same Premium/Alumni engine used everywhere else.
  private async initiateResearchCheckout(
    userId: string,
    dto: CreateCheckoutDto,
  ) {
    if (!dto.paperId) throw new BadRequestException('paperId is required.');
    const paper = await this.prisma.researchPaper.findUnique({
      where: { id: dto.paperId },
    });
    if (!paper) throw new NotFoundException('Research paper not found.');
    if (paper.priceBdt === 0 && paper.priceUsd === 0) {
      throw new BadRequestException('This paper is free — no checkout needed.');
    }

    const basePrice = dto.currency === 'BDT' ? paper.priceBdt : paper.priceUsd;
    const { discountPercent, finalPrice } =
      await this.membershipService.calculatePrice(userId, basePrice);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: dto.type,
        paperId: dto.paperId,
        currency: dto.currency,
        amount: basePrice,
        discountPercent,
        status: 'PENDING',
      },
    });

    const gateway = await this.createGatewayCheckout(
      userId,
      payment.id,
      finalPrice,
      dto.currency,
      paper.title,
    );
    if (gateway) return { payment, finalPrice, ...gateway };

    return {
      payment,
      checkoutUrl: null,
      live: false,
      finalPrice,
      message: `${NOT_LIVE_MESSAGE} We'll unlock "${paper.title}" for you once it clears.`,
    };
  }

  // REQ-042: by the time a user reaches checkout, the free-for-tier/alumni
  // overrides in ProgramsService.enroll() have already been ruled out (that
  // path enrolls directly at zero cost) — so this only needs the standard
  // percentage discount, same as Blog/Research.
  private async initiateProgramCheckout(
    userId: string,
    dto: CreateCheckoutDto,
  ) {
    if (!dto.programId) throw new BadRequestException('programId is required.');
    const program = await this.prisma.program.findUnique({
      where: { id: dto.programId },
    });
    if (!program) throw new NotFoundException('Program not found.');
    if (program.priceBdt === 0 && program.priceUsd === 0) {
      throw new BadRequestException(
        'This program is free — enroll directly instead.',
      );
    }

    const basePrice =
      dto.currency === 'BDT' ? program.priceBdt : program.priceUsd;
    const { discountPercent, finalPrice } =
      await this.membershipService.calculatePrice(userId, basePrice);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: dto.type,
        programId: dto.programId,
        currency: dto.currency,
        amount: basePrice,
        discountPercent,
        status: 'PENDING',
      },
    });

    const gateway = await this.createGatewayCheckout(
      userId,
      payment.id,
      finalPrice,
      dto.currency,
      program.title,
    );
    if (gateway) return { payment, finalPrice, ...gateway };

    return {
      payment,
      checkoutUrl: null,
      live: false,
      finalPrice,
      message: `${NOT_LIVE_MESSAGE} We'll enroll you in "${program.title}" once it clears.`,
    };
  }

  async listPayments(status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED') {
    const payments = await this.prisma.payment.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        blog: { select: { title: true } },
        paper: { select: { title: true } },
        program: { select: { title: true } },
      },
    });

    return payments.map((p) => ({
      id: p.id,
      userName: p.user.name,
      userEmail: p.user.email,
      type: p.type,
      membershipTier: p.membershipTier,
      blogTitle: p.blog?.title ?? null,
      paperTitle: p.paper?.title ?? null,
      programTitle: p.program?.title ?? null,
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

    return this.grantPayment(payment, {
      gateway: 'MANUAL',
      adminUserId,
      note: dto.note,
    });
  }

  // ── Gateway callbacks (SSLCommerz success_url / ipn_url) ──────────────────
  // Both routes converge here so a missed browser redirect (closed tab,
  // network drop) doesn't leave the payment stuck — the IPN backstop fires
  // the exact same logic. Safe to call twice: only PENDING payments proceed.

  async handleGatewaySuccess(tranId: string, bankTranId?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayReference: tranId },
    });
    if (!payment) return { handled: false };
    if (payment.status !== 'PENDING') return { handled: true, payment };

    await this.grantPayment(payment, {
      gateway: 'SSLCOMMERZ',
      note: bankTranId ? `SSLCommerz bank_tran_id: ${bankTranId}` : undefined,
    });
    return { handled: true, payment };
  }

  async handleGatewayFail(tranId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayReference: tranId },
    });
    if (!payment || payment.status !== 'PENDING') return { handled: false };
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    return { handled: true, payment };
  }

  async handleGatewayCancel(tranId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayReference: tranId },
    });
    if (!payment || payment.status !== 'PENDING') return { handled: false };
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED' },
    });
    return { handled: true, payment };
  }

  private async grantPayment(
    payment: {
      id: string;
      userId: string;
      type: string;
      membershipTier: string | null;
      blogId: string | null;
      paperId: string | null;
      programId: string | null;
    },
    opts: {
      gateway: PaymentGateway;
      gatewayReference?: string;
      adminUserId?: string;
      note?: string;
    },
  ) {
    if (payment.type === 'BLOG') return this.markBlogPaid(payment, opts);
    if (payment.type === 'RESEARCH')
      return this.markResearchPaid(payment, opts);
    if (payment.type === 'PROGRAM') return this.markProgramPaid(payment, opts);
    return this.markMembershipPaid(payment, opts);
  }

  private async markMembershipPaid(
    payment: { id: string; userId: string; membershipTier: string | null },
    opts: {
      gateway: PaymentGateway;
      gatewayReference?: string;
      adminUserId?: string;
      note?: string;
    },
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
          gateway: opts.gateway,
          gatewayReference: opts.gatewayReference,
          processedByUserId: opts.adminUserId,
          note: opts.note,
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
    opts: {
      gateway: PaymentGateway;
      gatewayReference?: string;
      adminUserId?: string;
      note?: string;
    },
  ) {
    if (!payment.blogId)
      throw new BadRequestException('Unsupported payment type.');

    const [updated, blog, user] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gateway: opts.gateway,
          gatewayReference: opts.gatewayReference,
          processedByUserId: opts.adminUserId,
          note: opts.note,
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

  private async markResearchPaid(
    payment: { id: string; userId: string; paperId: string | null },
    opts: {
      gateway: PaymentGateway;
      gatewayReference?: string;
      adminUserId?: string;
      note?: string;
    },
  ) {
    if (!payment.paperId)
      throw new BadRequestException('Unsupported payment type.');

    const [updated, paper, user] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gateway: opts.gateway,
          gatewayReference: opts.gatewayReference,
          processedByUserId: opts.adminUserId,
          note: opts.note,
        },
      }),
      this.prisma.researchPaper.findUniqueOrThrow({
        where: { id: payment.paperId },
      }),
      this.prisma.user.findUniqueOrThrow({ where: { id: payment.userId } }),
    ]);
    void updated;

    await this.emailService.sendPaperUnlockedEmail(
      user.email,
      paper.title,
      paper.slug,
    );
    return { success: true };
  }

  private async markProgramPaid(
    payment: { id: string; userId: string; programId: string | null },
    opts: {
      gateway: PaymentGateway;
      gatewayReference?: string;
      adminUserId?: string;
      note?: string;
    },
  ) {
    if (!payment.programId)
      throw new BadRequestException('Unsupported payment type.');

    const [, program, user] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gateway: opts.gateway,
          gatewayReference: opts.gatewayReference,
          processedByUserId: opts.adminUserId,
          note: opts.note,
        },
      }),
      this.prisma.program.findUniqueOrThrow({
        where: { id: payment.programId },
      }),
      this.prisma.user.findUniqueOrThrow({ where: { id: payment.userId } }),
    ]);

    await this.prisma.enrollment.upsert({
      where: {
        userId_programId: {
          userId: payment.userId,
          programId: payment.programId,
        },
      },
      create: { userId: payment.userId, programId: payment.programId },
      update: {},
    });

    await this.emailService.sendEnrollmentConfirmedEmail(
      user.email,
      program.title,
      program.slug,
    );
    return { success: true };
  }

  getSuggestedCurrency(countryCode?: string) {
    return { currency: countryCode?.toUpperCase() === 'BD' ? 'BDT' : 'USD' };
  }
}
