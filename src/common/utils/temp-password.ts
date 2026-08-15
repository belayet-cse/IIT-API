import { randomInt } from 'crypto';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

// Unique per call — deliberately not a shared/predictable value, since this
// is used to bootstrap real accounts before the user sets their own password.
export function generateTempPassword(length = 10): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[randomInt(CHARSET.length)];
  }
  return result;
}
