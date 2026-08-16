import { BlogStatus } from '@prisma/client';
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

const MAX_IMAGE_LENGTH = 8_000_000; // ~6MB decoded, comfortably under the 10mb body limit

export class CreateBlogDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_IMAGE_LENGTH)
  @Matches(/^$|^(data:image\/[a-z0-9+.-]+;base64,|https:\/\/)/i, {
    message: 'featuredImage must be a data:image/... URI or an https:// URL',
  })
  featuredImage?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

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
  @IsInt()
  @Min(1)
  readingTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sequence?: number;
}
