import { MembershipTier, PaymentCurrency, PaymentType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateCheckoutDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsEnum(MembershipTier)
  membershipTier: MembershipTier;

  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency;
}
