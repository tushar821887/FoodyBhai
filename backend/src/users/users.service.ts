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

  cleanPhone(raw: string): string {
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    } else if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    if (digits.length > 10) {
      digits = digits.slice(-10);
    }
    return digits;
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: string
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
      phone: phone ? this.cleanPhone(phone) : undefined,
      role: role || 'user',
      needsPasswordSet: false,
    });

    this.logger.log(`Creating new user: ${email.toLowerCase().trim()}`);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    if (!email) return null;
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    if (!phone) return null;
    const clean = this.cleanPhone(phone);
    if (!clean || clean.length < 10) return null;
    return this.userModel.findOne({
      $or: [
        { phone: clean },
        { phone: '0' + clean },
        { phone: '91' + clean },
        { phone: '+91' + clean },
        { phone: phone.trim() }
      ]
    });
  }

  async findByEmailOrPhone(identifier: string): Promise<UserDocument | null> {
    if (!identifier) return null;
    const trimmed = identifier.trim();
    const clean = this.cleanPhone(trimmed);
    // If identifier is 10 digits phone
    if (clean.length === 10) {
      const userByPhone = await this.findByPhone(clean);
      if (userByPhone) return userByPhone;
    }
    // Also try finding by email
    return this.userModel.findOne({ email: trimmed.toLowerCase() });
  }

  async createGuestUser(
    name: string,
    phone: string,
    email?: string,
    address?: string
  ): Promise<UserDocument> {
    const cleanP = this.cleanPhone(phone);
    let finalEmail = (email && email.trim()) 
      ? email.trim().toLowerCase() 
      : `${cleanP || Date.now()}@foodybhai.in`;

    // Check if email already registered
    const existingByEmail = await this.findByEmail(finalEmail);
    if (existingByEmail) {
      if (!existingByEmail.passwordHash || existingByEmail.needsPasswordSet) {
        return existingByEmail;
      }
      // If email is already taken by a registered password-protected user,
      // fallback to a unique guest alias to prevent identity collision
      finalEmail = `${cleanP || 'guest'}_${Date.now()}@foodybhai.in`;
    }

    const addresses = address ? [{ label: 'Delivery Address', fullAddress: address }] : [];

    const user = new this.userModel({
      name: (name && name.trim()) || 'Foody Guest',
      email: finalEmail,
      phone: cleanP || phone?.trim(),
      passwordHash: '',
      needsPasswordSet: true,
      isGuestConverted: true,
      role: 'user',
      addresses,
    });

    this.logger.log(`Auto-created guest user for phone: ${cleanP}, email: ${finalEmail}`);
    return user.save();
  }

  async setPassword(userId: string, newPassword: string): Promise<UserDocument | null> {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    this.logger.log(`Password set successfully for user: ${userId}`);
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        passwordHash,
        needsPasswordSet: false,
      },
      { new: true }
    ).select('-passwordHash');
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!hashedPassword) return false;
    if (plainPassword === hashedPassword) return true;
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async updateUser(id: string, updateData: any): Promise<UserDocument | null> {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      updateData.needsPasswordSet = false;
      delete updateData.password;
    }
    if (updateData.phone) {
      updateData.phone = this.cleanPhone(updateData.phone);
    }
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
  }

  async deleteUser(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id);
  }

  async addAddress(userId: string, addressData: { label: string, fullAddress: string }): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: addressData } },
      { new: true }
    );
  }

  async deleteAddress(userId: string, addressId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } } as any,
      { new: true }
    );
  }
}
