import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';

import { TokenResponseDto } from '@/auth/dto/token-response.dto';
import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { OrganizationService } from '@/organizations/providers/organization.service';
import { PlanService } from '@/plans/providers/plan.service';
import { RoleService } from '@/roles/providers/role.service';
import { environment } from '@/shared/env/environment';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { SubscriptionService } from '@/subscriptions/providers/subscription.service';
import { UserWithPasswordDto } from '@/users/dto/user.dto';
import { UserService } from '@/users/providers/user.service';

import { SignUpDto } from '../dto/sign-up.dto';
const DEFAULT_ROLE_NAME = 'manager';
const DEFAULT_PLAN_NAME = 'trial';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly roleService: RoleService,
    private readonly subscriptionService: SubscriptionService,
    private readonly planService: PlanService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  @HandleExceptions()
  async signIn(email: string, password: string): Promise<TokenResponseDto> {
    this.als.disableOrganizationValidation();
    const user = await this.userService.getByEmail(email);

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      throw new AppError(AppErrorCodesEnum.INVALID_CREDENTIALS);
    }

    return this.generateToken(user);
  }

  @HandleExceptions()
  async signUp(dto: SignUpDto): Promise<TokenResponseDto> {
    this.als.disableOrganizationValidation();
    const { name, email } = dto;

    const organization = await this.organizationService.create({ name });

    const managerRole = await this.roleService.getByName(DEFAULT_ROLE_NAME);

    await this.userService.create({
      ...dto,
      organizationId: organization.id,
      roleId: managerRole.id,
    });

    const user = await this.userService.getByEmail(email);

    const trialPlan = await this.planService.getByName(DEFAULT_PLAN_NAME);

    const now = new Date();
    await this.subscriptionService.create({
      organizationId: organization.id,
      planId: trialPlan.id,
      startDate: now,
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      nextResetDate: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      ),
    });

    return this.generateToken(user);
  }

  private generateToken(userDto: UserWithPasswordDto): TokenResponseDto {
    const {
      id,
      email,
      organizationId,
      role: { name },
    } = userDto;
    const payload = {
      sub: id,
      email,
      organizationId,
      role: name,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: environment.jwtSecret as string,
    });
    return { accessToken };
  }
}
