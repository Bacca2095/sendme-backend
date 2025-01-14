import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { environment } from '@/shared/env/environment';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

interface JwtPayload {
  email: string;
  sub: number;
  organizationId: number;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly als: AsyncLocalStorageService,
    private readonly db: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: id, email, organizationId } = payload;

    const role = await this.db.role.findFirst({
      where: {
        users: {
          some: {
            id,
          },
        },
      },
    });

    const permissions = await this.db.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            role: {
              name: role.name,
            },
          },
        },
      },
    });

    this.als.setUserInfo(
      id,
      organizationId,
      role.name,
      permissions.map((p) => p.name),
    );

    return { id, email, organizationId, role };
  }
}
