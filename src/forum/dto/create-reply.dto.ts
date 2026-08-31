import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsString()
  parentPostId?: string;
}
