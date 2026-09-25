import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

// Accepts a site-relative path ("/events") or a full http(s) URL — the two
// shapes an admin actually types when linking a notice somewhere.
const HREF_PATTERN = /^$|^(\/[^\s]*|https?:\/\/[^\s]+)$/;

export class CreateNoticeDto {
  @IsString()
  @MinLength(1)
  text: string;

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
