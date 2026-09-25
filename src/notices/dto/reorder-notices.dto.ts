import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderNoticesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds: string[];
}
