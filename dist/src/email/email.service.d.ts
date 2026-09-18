export declare class EmailService {
    private readonly logger;
    private readonly resend;
    private readonly from;
    constructor();
    sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
    sendContactInquiry(inquiry: {
        name: string;
        email: string;
        phone?: string;
        category: string;
        subject: string;
        message: string;
    }): Promise<void>;
    sendWelcomeCredentialsEmail(to: string, details: {
        tempPassword: string;
        roleLabel: string;
    }): Promise<void>;
    sendResearcherApprovedEmail(to: string): Promise<void>;
    sendAlumniVerificationResultEmail(to: string, matched: boolean): Promise<void>;
    sendMembershipExpiryReminderEmail(to: string, expiresAt: Date): Promise<void>;
    sendMembershipActivatedEmail(to: string, tier: string, expiresAt: Date): Promise<void>;
    sendBlogUnlockedEmail(to: string, blogTitle: string, blogSlug: string): Promise<void>;
    sendPaperUnlockedEmail(to: string, paperTitle: string, paperSlug: string): Promise<void>;
    sendEnrollmentConfirmedEmail(to: string, programTitle: string, programSlug: string): Promise<void>;
}
