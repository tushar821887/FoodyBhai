import { Controller, Post, Get, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async createMessage(@Body() body: any) {
    return this.contactService.create(body);
  }

  @Get()
  async getAllMessages() {
    return this.contactService.findAll();
  }
}
