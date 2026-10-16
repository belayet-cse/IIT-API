import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Certification } from '@prisma/client';

class AlumniImportEntry {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsEnum(Certification)
  certification?: Certification;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class ConfirmAlumniBulkImportDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AlumniImportEntry)
  entries: AlumniImportEntry[];

  // Defaults to a silent import (no email) — the admin opts in per batch.
  @IsOptional()
  @IsBoolean()
  sendWelcomeEmail?: boolean;
}
