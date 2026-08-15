import { MembershipTier } from '@prisma/client';
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export type RegistrationType = 'GENERAL' | 'PREMIUM' | 'ALUMNI';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  // Optional with a GENERAL default so the pre-existing single-path
  // registration form keeps working until it's updated to send this.
  @IsOptional()
  @IsIn(['GENERAL', 'PREMIUM', 'ALUMNI'])
  registrationType?: RegistrationType;

  @ValidateIf((dto: RegisterDto) => dto.registrationType === 'PREMIUM')
  @IsEnum(MembershipTier)
  membershipTier?: MembershipTier;
}
