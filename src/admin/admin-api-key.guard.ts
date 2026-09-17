import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.ADMIN_API_KEY;
    if (!secret) {
      throw new UnauthorizedException('Admin API key is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = readApiKey(request);
    if (!token) {
      throw new UnauthorizedException('Missing admin API key');
    }

    if (!secureEquals(token, secret)) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}

function readApiKey(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }

  const apiKey = request.headers['x-api-key'];
  return typeof apiKey === 'string' ? apiKey.trim() : undefined;
}

function secureEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
