import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<ContactDocument>) {}

  async create(contactData: any): Promise<ContactDocument> {
    const newContact = new this.contactModel(contactData);
    return newContact.save();
  }

  async findAll(): Promise<ContactDocument[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }
}
