import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateResearcherApplicationDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  organization: string;

  @IsString()
  @MinLength(1)
  currentRole: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertiseAreas?: string[];

  @IsString()
  @MinLength(1)
  bio: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;
}
