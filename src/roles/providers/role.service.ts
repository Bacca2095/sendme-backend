import { Injectable } from '@nestjs/common';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly db: PrismaService) {}

  @HandleExceptions()
  async get() {
    return this.db.role.findMany();
  }

  @HandleExceptions()
  async getById(id: number) {
    return this.db.role.findUniqueOrThrow({ where: { id } });
  }

  @HandleExceptions()
  async getByName(name: string) {
    return this.db.role.findUniqueOrThrow({ where: { name } });
  }

  @HandleExceptions()
  async create(data: CreateRoleDto) {
    return this.db.role.create({ data });
  }

  @HandleExceptions()
  async update(id: number, data: UpdateRoleDto) {
    return this.db.role.update({ where: { id }, data });
  }

  @HandleExceptions()
  async delete(id: number) {
    return this.db.role.delete({ where: { id } });
  }
}
