import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

const HREF_PATTERN = /^$|^(\/[^\s]*|https?:\/\/[^\s]+)$/;

export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  text?: string;

  @IsOptional()
  @IsString()
  @Matches(HREF_PATTERN, {
    message: 'href must be a site-relative path (e.g. /events) or a full https:// URL',
  })
  href?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
