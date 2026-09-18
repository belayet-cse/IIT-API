"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const membership_service_1 = require("../membership/membership.service");
const sslcommerz_1 = require("./sslcommerz");
const MEMBERSHIP_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
const NOT_LIVE_MESSAGE = "Online payment isn't live yet — we've recorded your order and will follow up to complete payment.";
let PaymentsService = class PaymentsService {
    prisma;
    emailService;
    membershipService;
    constructor(prisma, emailService, membershipService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.membershipService = membershipService;
    }
    async createGatewayCheckout(userId, paymentId, finalPrice, currency, productName) {
        if (!(0, sslcommerz_1.isSslcommerzConfigured)() || finalPrice <= 0)
            return null;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return null;
        const apiBaseUrl = process.env.API_BASE_URL;
        if (!apiBaseUrl)
            return null;
        const shortTranId = (0, crypto_1.randomBytes)(10).toString('hex');
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: { gatewayReference: shortTranId },
        });
        try {
            const checkoutUrl = await (0, sslcommerz_1.initiateSslcommerzPayment)({
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
        }
        catch {
            return null;
        }
    }
    async initiateCheckout(userId, dto) {
        if (dto.type === 'BLOG')
            return this.initiateBlogCheckout(userId, dto);
        if (dto.type === 'RESEARCH')
            return this.initiateResearchCheckout(userId, dto);
        if (dto.type === 'PROGRAM')
            return this.initiateProgramCheckout(userId, dto);
        return this.initiateMembershipCheckout(userId, dto);
    }
    async initiateMembershipCheckout(userId, dto) {
        if (!dto.membershipTier)
            throw new common_1.BadRequestException('membershipTier is required.');
        const plan = await this.prisma.membershipPlan.findUnique({
            where: { tier: dto.membershipTier },
        });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found.');
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
        const gateway = await this.createGatewayCheckout(userId, payment.id, amount, dto.currency, `IIT ${dto.membershipTier} Membership`);
        if (gateway)
            return { payment, ...gateway };
        return {
            payment,
            checkoutUrl: null,
            live: false,
            message: `${NOT_LIVE_MESSAGE} We'll activate your Premium benefits once it clears.`,
        };
    }
    async initiateBlogCheckout(userId, dto) {
        if (!dto.blogId)
            throw new common_1.BadRequestException('blogId is required.');
        const blog = await this.prisma.blog.findUnique({
            where: { id: dto.blogId },
        });
        if (!blog)
            throw new common_1.NotFoundException('Blog post not found.');
        if (blog.priceBdt === 0 && blog.priceUsd === 0) {
            throw new common_1.BadRequestException('This post is free — no checkout needed.');
        }
        const basePrice = dto.currency === 'BDT' ? blog.priceBdt : blog.priceUsd;
        const { discountPercent, finalPrice } = await this.membershipService.calculatePrice(userId, basePrice);
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
        const gateway = await this.createGatewayCheckout(userId, payment.id, finalPrice, dto.currency, blog.title);
        if (gateway)
            return { payment, finalPrice, ...gateway };
        return {
            payment,
            checkoutUrl: null,
            live: false,
            finalPrice,
            message: `${NOT_LIVE_MESSAGE} We'll unlock "${blog.title}" for you once it clears.`,
        };
    }
    async initiateResearchCheckout(userId, dto) {
        if (!dto.paperId)
            throw new common_1.BadRequestException('paperId is required.');
        const paper = await this.prisma.researchPaper.findUnique({
            where: { id: dto.paperId },
        });
        if (!paper)
            throw new common_1.NotFoundException('Research paper not found.');
        if (paper.priceBdt === 0 && paper.priceUsd === 0) {
            throw new common_1.BadRequestException('This paper is free — no checkout needed.');
        }
        const basePrice = dto.currency === 'BDT' ? paper.priceBdt : paper.priceUsd;
        const { discountPercent, finalPrice } = await this.membershipService.calculatePrice(userId, basePrice);
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
        const gateway = await this.createGatewayCheckout(userId, payment.id, finalPrice, dto.currency, paper.title);
        if (gateway)
            return { payment, finalPrice, ...gateway };
        return {
            payment,
            checkoutUrl: null,
            live: false,
            finalPrice,
            message: `${NOT_LIVE_MESSAGE} We'll unlock "${paper.title}" for you once it clears.`,
        };
    }
    async initiateProgramCheckout(userId, dto) {
        if (!dto.programId)
            throw new common_1.BadRequestException('programId is required.');
        const program = await this.prisma.program.findUnique({
            where: { id: dto.programId },
        });
        if (!program)
            throw new common_1.NotFoundException('Program not found.');
        if (program.priceBdt === 0 && program.priceUsd === 0) {
            throw new common_1.BadRequestException('This program is free — enroll directly instead.');
        }
        const basePrice = dto.currency === 'BDT' ? program.priceBdt : program.priceUsd;
        const { discountPercent, finalPrice } = await this.membershipService.calculatePrice(userId, basePrice);
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
        const gateway = await this.createGatewayCheckout(userId, payment.id, finalPrice, dto.currency, program.title);
        if (gateway)
            return { payment, finalPrice, ...gateway };
        return {
            payment,
            checkoutUrl: null,
            live: false,
            finalPrice,
            message: `${NOT_LIVE_MESSAGE} We'll enroll you in "${program.title}" once it clears.`,
        };
    }
    async listPayments(status) {
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
    async markPaid(paymentId, adminUserId, dto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found.');
        if (payment.status !== 'PENDING') {
            throw new common_1.ConflictException('This payment has already been processed.');
        }
        return this.grantPayment(payment, {
            gateway: 'MANUAL',
            adminUserId,
            note: dto.note,
        });
    }
    async handleGatewaySuccess(tranId, bankTranId) {
        const payment = await this.prisma.payment.findFirst({
            where: { gatewayReference: tranId },
        });
        if (!payment)
            return { handled: false };
        if (payment.status !== 'PENDING')
            return { handled: true, payment };
        await this.grantPayment(payment, {
            gateway: 'SSLCOMMERZ',
            note: bankTranId ? `SSLCommerz bank_tran_id: ${bankTranId}` : undefined,
        });
        return { handled: true, payment };
    }
    async handleGatewayFail(tranId) {
        const payment = await this.prisma.payment.findFirst({
            where: { gatewayReference: tranId },
        });
        if (!payment || payment.status !== 'PENDING')
            return { handled: false };
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
        });
        return { handled: true, payment };
    }
    async handleGatewayCancel(tranId) {
        const payment = await this.prisma.payment.findFirst({
            where: { gatewayReference: tranId },
        });
        if (!payment || payment.status !== 'PENDING')
            return { handled: false };
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'CANCELLED' },
        });
        return { handled: true, payment };
    }
    async grantPayment(payment, opts) {
        if (payment.type === 'BLOG')
            return this.markBlogPaid(payment, opts);
        if (payment.type === 'RESEARCH')
            return this.markResearchPaid(payment, opts);
        if (payment.type === 'PROGRAM')
            return this.markProgramPaid(payment, opts);
        return this.markMembershipPaid(payment, opts);
    }
    async markMembershipPaid(payment, opts) {
        if (!payment.membershipTier)
            throw new common_1.BadRequestException('Unsupported payment type.');
        const membershipTier = payment.membershipTier;
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
        await this.emailService.sendMembershipActivatedEmail(user.email, membershipTier, expiresAt);
        return { success: true };
    }
    async markBlogPaid(payment, opts) {
        if (!payment.blogId)
            throw new common_1.BadRequestException('Unsupported payment type.');
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
        await this.emailService.sendBlogUnlockedEmail(user.email, blog.title, blog.slug);
        return { success: true };
    }
    async markResearchPaid(payment, opts) {
        if (!payment.paperId)
            throw new common_1.BadRequestException('Unsupported payment type.');
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
        await this.emailService.sendPaperUnlockedEmail(user.email, paper.title, paper.slug);
        return { success: true };
    }
    async markProgramPaid(payment, opts) {
        if (!payment.programId)
            throw new common_1.BadRequestException('Unsupported payment type.');
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
        await this.emailService.sendEnrollmentConfirmedEmail(user.email, program.title, program.slug);
        return { success: true };
    }
    getSuggestedCurrency(countryCode) {
        return { currency: countryCode?.toUpperCase() === 'BD' ? 'BDT' : 'USD' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        membership_service_1.MembershipService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map