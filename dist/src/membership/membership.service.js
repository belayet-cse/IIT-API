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
exports.MembershipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const TIER_ORDER = { BASIC: 0, PRO: 1, ELITE: 2 };
const REMINDER_WINDOW_DAYS = 7;
let MembershipService = class MembershipService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async getPlans() {
        const plans = await this.prisma.membershipPlan.findMany();
        return plans.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
    }
    async updatePlan(tier, dto) {
        const existing = await this.prisma.membershipPlan.findUnique({ where: { tier } });
        if (!existing)
            throw new common_1.NotFoundException('Plan not found.');
        return this.prisma.membershipPlan.update({ where: { tier }, data: dto });
    }
    async calculatePrice(userId, basePrice) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { alumniProfile: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        let discountPercent = 0;
        if (user.role === 'ALUMNI' && user.alumniProfile) {
            discountPercent = user.alumniProfile.certDiscountPercent;
        }
        else if (user.role === 'PREMIUM' && user.membershipTier) {
            const plan = await this.prisma.membershipPlan.findUnique({ where: { tier: user.membershipTier } });
            discountPercent = plan?.discountPercent ?? 0;
        }
        const discountAmount = Math.round((basePrice * discountPercent) / 100);
        const finalPrice = Math.max(0, basePrice - discountAmount);
        return { originalPrice: basePrice, discountPercent, discountAmount, finalPrice };
    }
    async expressInterest(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { desiredMembershipTier: dto.membershipTier },
        });
        return { desiredMembershipTier: user.desiredMembershipTier };
    }
    async runExpiryCheck() {
        const now = new Date();
        const reminderCutoff = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        const expiringSoon = await this.prisma.user.findMany({
            where: {
                role: 'PREMIUM',
                membershipExpiresAt: { gt: now, lte: reminderCutoff },
            },
        });
        await Promise.all(expiringSoon.map((u) => this.emailService.sendMembershipExpiryReminderEmail(u.email, u.membershipExpiresAt)));
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
};
exports.MembershipService = MembershipService;
exports.MembershipService = MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], MembershipService);
//# sourceMappingURL=membership.service.js.map