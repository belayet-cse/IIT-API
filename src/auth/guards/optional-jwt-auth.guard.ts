import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Populates req.user when a valid bearer token is present, but never blocks
// the request when it's absent or invalid — for routes that behave
// differently for logged-in users without requiring login (e.g. gated blog
// reading, REQ-083).
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
