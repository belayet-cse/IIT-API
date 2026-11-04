import { StrongPassword } from '../../common/validators/strong-password';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @StrongPassword()
  newPassword: string;
}
