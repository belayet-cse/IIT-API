import { IsOptional, IsString } from 'class-validator';

export class RejectResearcherApplicationDto {
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
