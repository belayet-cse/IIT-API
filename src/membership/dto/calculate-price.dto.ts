import { IsInt, Min } from 'class-validator';

export class CalculatePriceDto {
  @IsInt()
  @Min(0)
  price: number;
}
