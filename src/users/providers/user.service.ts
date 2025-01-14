import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';

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

  async get(): Promise<UserDto[]> {
    const users = await this.db.user.findMany({
      omit: { password: true },
      include: { userRoles: { include: { role: true } } },
    });

    return users.map((user) => ({
      ...user,
      role: user.userRoles[0].role,
    }));
  }

  async getById(id: number): Promise<UserDto> {
    const user = await this.db.user.findUniqueOrThrow({
      where: { id },
      omit: { password: true },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      ...user,
      role: user.userRoles[0].role,
    };
  }

  async getByEmail(email: string): Promise<UserWithPasswordDto> {
    const user = await this.db.user.findUniqueOrThrow({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      ...user,
      role: user.userRoles[0].role,
    };
  }

  async create(data: CreateUserDto): Promise<UserDto> {
    const { password } = data;

    const hashedPassword = await hash(password);

    const user = await this.db.user.create({
      data: { ...data, password: hashedPassword },
    });

    const userWithRole = await this.db.user.findUniqueOrThrow({
      where: { id: user.id },
      omit: { password: true },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      ...userWithRole,
      role: userWithRole.userRoles[0].role,
    };
  }

  async update(id: number, data: UpdateUserDto): Promise<UserDto> {
    const { password, ...rest } = data;
    const hashedPassword = password ? await hash(password) : undefined;
    const updatedUser = await this.db.user.update({
      where: { id },
      data: { ...rest, password: hashedPassword },
    });

    const userWithRole = await this.db.user.findUniqueOrThrow({
      where: { id: updatedUser.id },
      omit: { password: true },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      ...userWithRole,
      role: userWithRole.userRoles[0].role,
    };
  }

  async remove(id: number): Promise<UserDto> {
    const user = await this.db.user.delete({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      ...user,
      role: user.userRoles[0].role,
    };
  }
}
