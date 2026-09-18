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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    resend;
    from;
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        this.resend = apiKey ? new resend_1.Resend(apiKey) : null;
        this.from = process.env.EMAIL_FROM ?? 'IIT Alumni <no-reply@iit.org>';
    }
    async sendPasswordResetEmail(to, resetUrl) {
        if (!this.resend) {
            this.logger.log(`[dev email] Password reset link for ${to}: ${resetUrl}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: 'Reset your IIT Alumni password',
            html: `<p>Click the link below to reset your password. This link expires in 24 hours.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
    }
    async sendContactInquiry(inquiry) {
        const inbox = process.env.CONTACT_INBOX ?? 'iitrade.org@gmail.com';
        const html = `
      <p><strong>Category:</strong> ${escapeHtml(inquiry.category)}</p>
      <p><strong>From:</strong> ${escapeHtml(inquiry.name)} (${escapeHtml(inquiry.email)})</p>
      ${inquiry.phone ? `<p><strong>Phone:</strong> ${escapeHtml(inquiry.phone)}</p>` : ''}
      <p><strong>Subject:</strong> ${escapeHtml(inquiry.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(inquiry.message).replace(/\n/g, '<br/>')}</p>
    `;
        if (!this.resend) {
            this.logger.log(`[dev email] Contact inquiry from ${inquiry.email}: ${inquiry.subject}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to: inbox,
            replyTo: inquiry.email,
            subject: `[Contact] ${inquiry.subject}`,
            html,
        });
    }
    async sendWelcomeCredentialsEmail(to, details) {
        const loginUrl = `${process.env.WEB_APP_URL}/login`;
        const html = `
      <p>Your ${escapeHtml(details.roleLabel)} account is ready.</p>
      <p><strong>Login email:</strong> ${escapeHtml(to)}</p>
      <p><strong>Temporary password:</strong> ${escapeHtml(details.tempPassword)}</p>
      <p>Sign in at <a href="${loginUrl}">${loginUrl}</a> — you'll be asked to set your own
      password on first login.</p>
    `;
        if (!this.resend) {
            this.logger.log(`[dev email] Welcome credentials for ${to}: ${details.tempPassword}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: `Welcome to IIT — your ${details.roleLabel} account is ready`,
            html,
        });
    }
    async sendResearcherApprovedEmail(to) {
        const dashboardUrl = `${process.env.WEB_APP_URL}/researcher/dashboard`;
        const html = `
      <p>Your Researcher application has been approved. Your account now has Researcher access.</p>
      <p>Visit your dashboard at <a href="${dashboardUrl}">${dashboardUrl}</a> to get started.</p>
    `;
        if (!this.resend) {
            this.logger.log(`[dev email] Researcher approval notice for ${to}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: 'Your IIT Researcher application has been approved',
            html,
        });
    }
    async sendAlumniVerificationResultEmail(to, matched) {
        const html = matched
            ? `<p>Good news — your alumni status has been verified. You now have full alumni access, including directory listing, discussion forum, and member discounts.</p>`
            : `<p>We reviewed our verified alumni records and couldn't find a match for your email address. Your account remains active as a General Member. If you believe this is an error, please contact us.</p>`;
        if (!this.resend) {
            this.logger.log(`[dev email] Alumni verification result for ${to}: matched=${matched}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: matched
                ? 'Your IIT alumni status is verified'
                : 'Update on your IIT alumni verification',
            html,
        });
    }
    async sendMembershipExpiryReminderEmail(to, expiresAt) {
        const dateLabel = expiresAt.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        const html = `<p>Your IIT Premium membership expires on <strong>${dateLabel}</strong>. Renew soon to keep your
      member discounts and benefits without interruption.</p>`;
        if (!this.resend) {
            this.logger.log(`[dev email] Membership expiry reminder for ${to}: expires ${dateLabel}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: 'Your IIT Premium membership expires soon',
            html,
        });
    }
    async sendMembershipActivatedEmail(to, tier, expiresAt) {
        const dateLabel = expiresAt.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        const html = `<p>Your IIT Premium membership (${escapeHtml(tier)} tier) is now active and valid until
      <strong>${dateLabel}</strong>. Thanks for joining!</p>`;
        if (!this.resend) {
            this.logger.log(`[dev email] Membership activated for ${to}: ${tier}, expires ${dateLabel}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: 'Your IIT Premium membership is active',
            html,
        });
    }
    async sendBlogUnlockedEmail(to, blogTitle, blogSlug) {
        const postUrl = `${process.env.WEB_APP_URL}/blogs/${blogSlug}`;
        const html = `<p>Your purchase of <strong>${escapeHtml(blogTitle)}</strong> has been confirmed. Read it now at
      <a href="${postUrl}">${postUrl}</a>.</p>`;
        if (!this.resend) {
            this.logger.log(`[dev email] Blog unlocked for ${to}: ${blogTitle}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: `You now have access to "${blogTitle}"`,
            html,
        });
    }
    async sendPaperUnlockedEmail(to, paperTitle, paperSlug) {
        const paperUrl = `${process.env.WEB_APP_URL}/research/${paperSlug}`;
        const html = `<p>Your purchase of <strong>${escapeHtml(paperTitle)}</strong> has been confirmed. Read it now at
      <a href="${paperUrl}">${paperUrl}</a>.</p>`;
        if (!this.resend) {
            this.logger.log(`[dev email] Paper unlocked for ${to}: ${paperTitle}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: `You now have access to "${paperTitle}"`,
            html,
        });
    }
    async sendEnrollmentConfirmedEmail(to, programTitle, programSlug) {
        const programUrl = `${process.env.WEB_APP_URL}/programs/${programSlug}`;
        const html = `<p>Your enrollment in <strong>${escapeHtml(programTitle)}</strong> has been confirmed. Start learning at
      <a href="${programUrl}">${programUrl}</a>.</p>`;
        if (!this.resend) {
            this.logger.log(`[dev email] Enrollment confirmed for ${to}: ${programTitle}`);
            return;
        }
        await this.resend.emails.send({
            from: this.from,
            to,
            subject: `You're enrolled in "${programTitle}"`,
            html,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map