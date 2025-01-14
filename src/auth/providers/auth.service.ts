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
import { SubscriptionService } from '@/subscriptions/providers/subscription.service';
import { UserDto } from '@/users/dto/user.dto';
import { UserService } from '@/users/providers/user.service';

import { SignUpDto } from '../dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly roleService: RoleService,
    private readonly subscriptionService: SubscriptionService,
    private readonly planService: PlanService,
  ) {}

  @HandleExceptions()
  async signIn(email: string, password: string): Promise<TokenResponseDto> {
    const user = await this.userService.getByEmail(email);

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      throw new AppError(AppErrorCodesEnum.INVALID_CREDENTIALS);
    }

    return this.generateToken(user);
  }

  @HandleExceptions()
  async signUp(dto: SignUpDto): Promise<TokenResponseDto> {
    const { name } = dto;

    // Crear organización
    const organization = await this.organizationService.create({ name });

    // Obtener rol de 'manager'
    const managerRole = await this.roleService.getByName('manager');

    // Crear usuario asociado a la organización
    const user = await this.userService.create({
      ...dto,
      organizationId: organization.id,
      roleId: managerRole.id,
    });

    // Obtener el plan de prueba ('trial')
    const trialPlan = await this.planService.getByName('trial');

    // Crear suscripción asociada a la organización
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

  private generateToken(userDto: UserDto): TokenResponseDto {
    const { id, email, organizationId, role } = userDto;
    const payload = { sub: id, email, organizationId, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: environment.jwtSecret as string,
    });
    return { accessToken };
  }
}
