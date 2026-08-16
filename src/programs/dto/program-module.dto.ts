import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ProgramModuleDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sequence?: number;
}
