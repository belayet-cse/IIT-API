import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    submit(dto: CreateInquiryDto): Promise<{
        success: boolean;
    }>;
}
