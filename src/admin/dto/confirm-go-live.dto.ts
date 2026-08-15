import { ArrayMinSize, IsArray, IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GoLiveEntry {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;
}

export class ConfirmGoLiveDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GoLiveEntry)
  entries: GoLiveEntry[];
}
