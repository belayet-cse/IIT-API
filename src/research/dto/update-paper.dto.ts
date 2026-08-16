import { BlogStatus, Certification } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const MAX_IMAGE_LENGTH = 8_000_000;

export class UpdatePaperDto {
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
  abstract?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_IMAGE_LENGTH)
  @Matches(/^$|^(data:image\/[a-z0-9+.-]+;base64,|https:\/\/)/i, {
    message: 'featuredImage must be a data:image/... URI or an https:// URL',
  })
  featuredImage?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceBdt?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceUsd?: number;

  @IsOptional()
  @IsEnum(Certification)
  certification?: Certification;

  @IsOptional()
  @IsInt()
  @Min(1)
  readingTime?: number;
}
