import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { OrganizationService } from '@/organizations/providers/organization.service';
import { PlanService } from '@/plans/providers/plan.service';
import { RoleService } from '@/roles/providers/role.service';
import { environment } from '@/shared/env/environment';
import { SubscriptionService } from '@/subscriptions/providers/subscription.service';
import { UserService } from '@/users/providers/user.service';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        secret: environment.jwtSecret,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    AuthService,
    UserService,
    OrganizationService,
    JwtStrategy,
    RoleService,
    SubscriptionService,
    PlanService,
  ],
  exports: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
