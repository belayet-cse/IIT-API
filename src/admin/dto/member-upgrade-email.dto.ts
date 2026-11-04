import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class MemberUpgradeEmailDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  @IsEmail({}, { each: true })
  emails: string[];

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
