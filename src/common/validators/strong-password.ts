import { applyDecorators } from '@nestjs/common';
import { IsString, IsStrongPassword } from 'class-validator';

export const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.';

export function StrongPassword() {
  return applyDecorators(
    IsString(),
    IsStrongPassword(
      { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
      { message: PASSWORD_RULE_MESSAGE },
    ),
  );
}
