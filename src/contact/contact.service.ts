import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async submit(dto: CreateInquiryDto) {
    await this.emailService.sendContactInquiry(dto);
    return { success: true };
  }
}
