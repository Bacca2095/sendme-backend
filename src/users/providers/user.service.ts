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
    return this.db.user.findMany({
      omit: { password: true },
    });
  }

  async getById(id: number): Promise<UserDto> {
    return this.db.user.findUniqueOrThrow({
      where: { id },
      omit: { password: true },
    });
  }

  async getByEmail(email: string): Promise<UserWithPasswordDto> {
    return this.db.user.findUniqueOrThrow({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<UserDto> {
    const { password } = data;

    const hashedPassword = await hash(password);

    return this.db.user.create({
      data: { ...data, password: hashedPassword },
      omit: { password: true },
    });
  }

  async update(id: number, data: UpdateUserDto): Promise<UserDto> {
    const { password, ...rest } = data;
    const hashedPassword = password ? await hash(password) : undefined;
    return this.db.user.update({
      where: { id },
      data: { ...rest, password: hashedPassword },
      omit: { password: true },
    });
  }

  async remove(id: number): Promise<UserDto> {
    return this.db.user.delete({ where: { id }, omit: { password: true } });
  }
}
