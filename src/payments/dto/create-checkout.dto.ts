import { MembershipTier, PaymentCurrency, PaymentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsEnum(MembershipTier)
  membershipTier?: MembershipTier;

  @IsOptional()
  @IsString()
  blogId?: string;

  @IsOptional()
  @IsString()
  paperId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency;
}
