import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { environment } from '@/shared/env/environment';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';

interface JwtPayload {
  email: string;
  sub: number;
  organizationId: number;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly als: AsyncLocalStorageService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: id, email, role, organizationId } = payload;

    this.als.setUserInfo(id, organizationId, role);

    return { id, email, organizationId, role };
  }
}
