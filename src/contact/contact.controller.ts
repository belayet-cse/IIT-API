import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  submit(@Body() dto: CreateInquiryDto) {
    return this.contactService.submit(dto);
  }
}
