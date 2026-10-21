import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class Address {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  fullAddress: string;
}

const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      if (ret.addresses) {
        ret.addresses = ret.addresses.map((a: any) => ({
          ...a,
          id: a._id ? a._id.toString() : undefined,
        }));
      }
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({ trim: true, index: true })
  phone: string;

  @Prop({ required: false, default: '' })
  passwordHash: string;

  @Prop({ type: String, default: null })
  resetOtp: string | null;

  @Prop({ type: Date, default: null })
  resetOtpExpires: Date | null;

  @Prop({ type: String, default: null })
  resetToken: string | null;

  @Prop({ type: Date, default: null })
  resetTokenExpires: Date | null;

  @Prop({ default: false })
  needsPasswordSet: boolean;

  @Prop({ default: false })
  isGuestConverted: boolean;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop({ type: String })
  dateOfBirth: string;

  @Prop({ type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''] })
  gender: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);
