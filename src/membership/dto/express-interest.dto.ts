import { MembershipTier } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ExpressInterestDto {
  @IsEnum(MembershipTier)
  membershipTier: MembershipTier;
}
