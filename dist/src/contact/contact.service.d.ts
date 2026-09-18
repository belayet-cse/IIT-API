import { EmailService } from '../email/email.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
export declare class ContactService {
    private readonly emailService;
    constructor(emailService: EmailService);
    submit(dto: CreateInquiryDto): Promise<{
        success: boolean;
    }>;
}
