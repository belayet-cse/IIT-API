import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = process.env.EMAIL_FROM ?? 'IIT Alumni <no-reply@iit.org>';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
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

  async sendContactInquiry(inquiry: {
    name: string;
    email: string;
    phone?: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<void> {
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

  async sendWelcomeCredentialsEmail(
    to: string,
    details: { tempPassword: string; roleLabel: string },
  ): Promise<void> {
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

  async sendResearcherApprovedEmail(to: string): Promise<void> {
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

  async sendAlumniVerificationResultEmail(to: string, matched: boolean): Promise<void> {
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
      subject: matched ? 'Your IIT alumni status is verified' : 'Update on your IIT alumni verification',
      html,
    });
  }

  async sendMembershipExpiryReminderEmail(to: string, expiresAt: Date): Promise<void> {
    const dateLabel = expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

  async sendMembershipActivatedEmail(to: string, tier: string, expiresAt: Date): Promise<void> {
    const dateLabel = expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
}
