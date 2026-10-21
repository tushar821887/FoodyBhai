import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsNotEmpty({ message: 'Email or phone number is required' })
  @IsString({ message: 'Email or phone number must be a string' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
