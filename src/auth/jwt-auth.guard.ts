import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import type { Request } from 'express';
import { User } from '../database/models';

export interface AuthenticatedRequest extends Request {
  user: User;
}
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(User) private readonly users: typeof User,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = /^Bearer (\S+)$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Please login to access this resource');
    let payload: { id: number };
    try {
      payload = await this.jwt.verifyAsync<{ id: number }>(match[1], { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (!Number.isInteger(payload.id) || payload.id < 1)
      throw new UnauthorizedException('Invalid token');
    const user = await this.users.findByPk(payload.id);
    if (!user) throw new UnauthorizedException('User no longer exists');
    request.user = user;
    return true;
  }
}
