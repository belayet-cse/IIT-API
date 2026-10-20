import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Login happens server-side from the web app, so every attempt shares one IP.
// Key the limit on the account being targeted instead, so one person guessing
// passwords is throttled without locking everyone else out.
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const body = req.body ?? {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const token = typeof body.token === 'string' ? body.token.slice(0, 16) : '';
    return email || token || req.ip;
  }
}
