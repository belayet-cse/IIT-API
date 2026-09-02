import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSubCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;
}
