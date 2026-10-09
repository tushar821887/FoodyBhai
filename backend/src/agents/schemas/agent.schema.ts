import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ timestamps: true, toJSON: { transform: (doc: any, ret: any) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } } })
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop({ required: false })
  passwordHash?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
