import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryAddressDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  pincode?: string;
}

export class CreateTiffinOrderDto {
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsEnum(['trial', 'weekly', 'monthly'])
  subscriptionType: 'trial' | 'weekly' | 'monthly';

  @IsNotEmpty()
  @IsEnum(['lunch', 'dinner', 'both'])
  mealSlot: 'lunch' | 'dinner' | 'both';

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  totalMeals?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsEnum(['cod', 'upi', 'online'])
  paymentMethod?: 'cod' | 'upi' | 'online';
}
