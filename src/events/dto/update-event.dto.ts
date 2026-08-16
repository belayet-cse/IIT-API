import { BlogStatus, EventFormat } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const MAX_IMAGE_LENGTH = 8_000_000;

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EventFormat)
  format?: EventFormat;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_IMAGE_LENGTH)
  @Matches(/^$|^(data:image\/[a-z0-9+.-]+;base64,|https:\/\/)/i, {
    message: 'featuredImage must be a data:image/... URI or an https:// URL',
  })
  featuredImage?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;
}
