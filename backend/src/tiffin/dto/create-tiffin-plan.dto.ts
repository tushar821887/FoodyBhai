import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min, IsArray, IsBoolean } from 'class-validator';

export class CreateTiffinPlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(['veg', 'non-veg', 'jain'])
  dietaryType?: string;

  @IsOptional()
  @IsEnum(['lunch', 'dinner', 'both'])
  mealType?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  trialPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weeklyPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @IsOptional()
  @IsNumber()
  perMealPrice?: number;

  @IsOptional()
  @IsArray()
  items?: string[];

  @IsOptional()
  @IsString()
  itemsHtml?: string;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsString()
  featuresHtml?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  isBestValue?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  lunchDeliveryTime?: string;

  @IsOptional()
  @IsString()
  dinnerDeliveryTime?: string;

  @IsOptional()
  @IsArray()
  weeklyMenu?: any[];
}
