import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto, UserWithPasswordDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly db: PrismaService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  @HandleExceptions()
  async get(): Promise<UserDto[]> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { organizationId } : {};

    const users = await this.db.user.findMany({
      omit: { password: true },
      include: { role: true },
      where: whereClause,
    });

    return users.map((user) => ({
      ...user,
      role: user.role,
    }));
  }

  @HandleExceptions()
  async getById(id: number): Promise<UserDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    const user = await this.db.user.findUniqueOrThrow({
      where: whereClause,
      omit: { password: true },
      include: { role: true },
    });

    return user;
  }

  @HandleExceptions()
  async getByEmail(email: string): Promise<UserWithPasswordDto> {
    const user = await this.db.user.findUniqueOrThrow({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    return {
      ...user,
      permissions: user.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    };
  }

  @HandleExceptions()
  async create(data: CreateUserDto): Promise<UserDto> {
    const organizationId = this.als.getValidatedOrganizationId(
      data.organizationId,
    );

    if (!organizationId) {
      throw new AppError(AppErrorCodesEnum.ORGANIZATION_ID_NOT_FOUND);
    }

    const { password, roleId, ...rest } = data;
    const hashedPassword = await hash(password);

    const user = await this.db.user.create({
      data: {
        ...rest,
        organizationId,
        password: hashedPassword,
        roleId,
      },
    });

    const userWithRole = await this.db.user.findUniqueOrThrow({
      where: { id: user.id },
      omit: { password: true },
      include: { role: true },
    });

    return userWithRole;
  }

  @HandleExceptions()
  async update(id: number, data: UpdateUserDto): Promise<UserDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    const { password, roleId, ...rest } = data;
    const hashedPassword = password ? await hash(password) : undefined;

    await this.db.user.update({
      where: { id, organizationId },
      data: { ...rest, password: hashedPassword, roleId },
    });

    const userWithRole = await this.db.user.findUniqueOrThrow({
      where: { id },
      omit: { password: true },
      include: { role: true },
    });

    return userWithRole;
  }

  @HandleExceptions()
  async remove(id: number): Promise<UserDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    const user = await this.db.user.delete({
      where: whereClause,
      include: { role: true },
    });

    return user;
  }
}
