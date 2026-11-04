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
      this.logger.log(
        `[dev email] Contact inquiry from ${inquiry.email}: ${inquiry.subject}`,
      );
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

  // Credentials emails (member upgrade + approved alumni) share one layout:
  // website, user ID, temporary password, and the forced-change notice.
  private credentialsEmail(
    intro: string[],
    to: string,
    tempPassword: string,
  ): { html: string; text: string } {
    const site = process.env.WEB_APP_URL ?? 'https://iitrade.org';
    const html = `
      <p>Dear iitrade Member,</p>
      <p>Greetings from iitrade.org!</p>
      ${intro.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
      <p><strong>Website:</strong> <a href="${site}">${site}</a><br />
      <strong>User ID:</strong> ${escapeHtml(to)}<br />
      <strong>Temporary Password:</strong> ${escapeHtml(tempPassword)}</p>
      <p><strong>Action Required: Change Your Password</strong><br />
      For security reasons, please log in using the above credentials and change your password
      immediately upon your first login. You will be asked to choose a new, strong password
      (at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character).</p>
      <p>We are continuously working to make iitrade.org a more engaging and valuable platform for
      international trade professionals. Your suggestions, ideas, and feedback are always welcome as we
      continue improving the platform around your needs.</p>
      <p><em>Your ideas. Your experience. Your iitrade.</em></p>
      <p>Thank you for being part of our community.</p>
      <p>Best regards,<br />Team iitrade<br /><a href="${site}">${site}</a></p>
    `;
    const text = [
      'Dear iitrade Member,',
      '',
      'Greetings from iitrade.org!',
      '',
      ...intro.flatMap((p) => [p, '']),
      `Website: ${site}`,
      `User ID: ${to}`,
      `Temporary Password: ${tempPassword}`,
      '',
      'Action Required: Change Your Password',
      'For security reasons, please log in using the above credentials and change your password immediately upon your first login. You will be asked to choose a new, strong password (at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character).',
      '',
      'We are continuously working to make iitrade.org a more engaging and valuable platform for international trade professionals. Your suggestions, ideas, and feedback are always welcome as we continue improving the platform around your needs.',
      '',
      'Your ideas. Your experience. Your iitrade.',
      '',
      'Thank you for being part of our community.',
      '',
      'Best regards,',
      'Team iitrade',
      site,
    ].join('\n');
    return { html, text };
  }

  async sendMemberUpgradeEmail(to: string, tempPassword: string): Promise<void> {
    const { html, text } = this.credentialsEmail(
      [
        'We are pleased to inform you that iitrade.org has recently undergone a major upgrade, along with improvements to its design, functionality, and overall user experience.',
        'As part of this upgrade, your user account has been configured in our updated system. Please find your login credentials below:',
      ],
      to,
      tempPassword,
    );
    if (!this.resend) {
      this.logger.log(`[dev email] Member upgrade credentials for ${to}`);
      return;
    }
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'iitrade.org has been upgraded - your new login details',
      html,
      text,
    });
    if (error) throw new Error(error.message);
  }

  async sendWelcomeCredentialsEmail(
    to: string,
    details: { tempPassword: string; roleLabel: string },
  ): Promise<void> {
    const alumni = /alumni/i.test(details.roleLabel);
    const { html, text } = this.credentialsEmail(
      [
        alumni
          ? 'Your iitrade.org alumni registration has been approved. Your alumni account is ready, with your login credentials below:'
          : `Your ${details.roleLabel} account is ready. Please find your login credentials below:`,
      ],
      to,
      details.tempPassword,
    );

    if (!this.resend) {
      this.logger.log(`[dev email] Welcome credentials for ${to}`);
      return;
    }
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: alumni
        ? 'Your iitrade.org alumni registration is approved - login details'
        : `Welcome to iitrade.org - your ${details.roleLabel} account is ready`,
      html,
      text,
    });
    if (error) throw new Error(error.message);
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

  async sendAlumniVerificationResultEmail(
    to: string,
    matched: boolean,
  ): Promise<void> {
    const html = matched
      ? `<p>Good news — your alumni status has been verified. You now have full alumni access, including directory listing, discussion forum, and member discounts.</p>`
      : `<p>We reviewed our verified alumni records and couldn't find a match for your email address. Your account remains active as a General Member. If you believe this is an error, please contact us.</p>`;

    if (!this.resend) {
      this.logger.log(
        `[dev email] Alumni verification result for ${to}: matched=${matched}`,
      );
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

  async sendMembershipExpiryReminderEmail(
    to: string,
    expiresAt: Date,
  ): Promise<void> {
    const dateLabel = expiresAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const html = `<p>Your IIT Premium membership expires on <strong>${dateLabel}</strong>. Renew soon to keep your
      member discounts and benefits without interruption.</p>`;

    if (!this.resend) {
      this.logger.log(
        `[dev email] Membership expiry reminder for ${to}: expires ${dateLabel}`,
      );
      return;
    }
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Your IIT Premium membership expires soon',
      html,
    });
  }

  async sendMembershipActivatedEmail(
    to: string,
    tier: string,
    expiresAt: Date,
  ): Promise<void> {
    const dateLabel = expiresAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const html = `<p>Your IIT Premium membership (${escapeHtml(tier)} tier) is now active and valid until
      <strong>${dateLabel}</strong>. Thanks for joining!</p>`;

    if (!this.resend) {
      this.logger.log(
        `[dev email] Membership activated for ${to}: ${tier}, expires ${dateLabel}`,
      );
      return;
    }
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Your IIT Premium membership is active',
      html,
    });
  }

  async sendBlogUnlockedEmail(
    to: string,
    blogTitle: string,
    blogSlug: string,
  ): Promise<void> {
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

  async sendPaperUnlockedEmail(
    to: string,
    paperTitle: string,
    paperSlug: string,
  ): Promise<void> {
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

  async sendEnrollmentConfirmedEmail(
    to: string,
    programTitle: string,
    programSlug: string,
  ): Promise<void> {
    const programUrl = `${process.env.WEB_APP_URL}/programs/${programSlug}`;
    const html = `<p>Your enrollment in <strong>${escapeHtml(programTitle)}</strong> has been confirmed. Start learning at
      <a href="${programUrl}">${programUrl}</a>.</p>`;

    if (!this.resend) {
      this.logger.log(
        `[dev email] Enrollment confirmed for ${to}: ${programTitle}`,
      );
      return;
    }
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `You're enrolled in "${programTitle}"`,
      html,
    });
  }
}
