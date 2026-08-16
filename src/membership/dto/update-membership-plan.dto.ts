import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class UpdateMembershipPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  displayName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceBdt?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceUsd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number;
}
