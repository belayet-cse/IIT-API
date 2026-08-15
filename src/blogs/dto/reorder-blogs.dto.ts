import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderBlogsDto {
  @IsString()
  category: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds: string[];
}
