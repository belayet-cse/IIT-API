import { BlogStatus, ProgramType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgramModuleDto } from './program-module.dto';

const MAX_IMAGE_LENGTH = 8_000_000;

export class CreateProgramDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsEnum(ProgramType)
  type: ProgramType;

  @IsString()
  @MinLength(1)
  overview: string;

  @IsOptional()
  @IsString()
  whoItsFor?: string;

  @IsOptional()
  @IsString()
  examInfo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_IMAGE_LENGTH)
  @Matches(/^$|^(data:image\/[a-z0-9+.-]+;base64,|https:\/\/)/i, {
    message: 'featuredImage must be a data:image/... URI or an https:// URL',
  })
  featuredImage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceBdt?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceUsd?: number;

  @IsOptional()
  @IsBoolean()
  freeForBasic?: boolean;

  @IsOptional()
  @IsBoolean()
  freeForPro?: boolean;

  @IsOptional()
  @IsBoolean()
  freeForElite?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramModuleDto)
  modules?: ProgramModuleDto[];
}
