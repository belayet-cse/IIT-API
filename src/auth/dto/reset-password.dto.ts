import { StrongPassword } from '../../common/validators/strong-password';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @StrongPassword()
  password: string;
}
