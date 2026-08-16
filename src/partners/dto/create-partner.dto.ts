import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const MAX_IMAGE_LENGTH = 8_000_000;

export class CreatePartnerDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MaxLength(MAX_IMAGE_LENGTH)
  @Matches(/^(data:image\/[a-z0-9+.-]+;base64,|https:\/\/)/i, {
    message: 'logoUrl must be a data:image/... URI or an https:// URL',
  })
  logoUrl: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}
