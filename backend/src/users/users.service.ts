import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<UserDocument> {
    // Check for duplicate email
    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new this.userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone?.trim(),
    });

    this.logger.log(`Creating new user: ${email.toLowerCase().trim()}`);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
