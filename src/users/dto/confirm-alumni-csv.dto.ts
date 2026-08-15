import { ArrayMinSize, IsArray, IsEmail } from 'class-validator';

export class ConfirmAlumniCsvDto {
  @IsArray()
  @ArrayMinSize(0)
  @IsEmail({}, { each: true })
  matchedEmails: string[];

  @IsArray()
  @ArrayMinSize(0)
  @IsEmail({}, { each: true })
  pendingNotMatchedEmails: string[];
}
