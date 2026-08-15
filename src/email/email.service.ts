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
}
