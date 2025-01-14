import { Injectable } from '@nestjs/common';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { PrismaService } from '@/shared/providers/prisma.service';

import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly db: PrismaService) {}

  @HandleExceptions()
  async get() {
    return this.db.permission.findMany();
  }

  @HandleExceptions()
  async getById(id: number) {
    return this.db.permission.findUnique({ where: { id } });
  }

  @HandleExceptions()
  async create(data: CreatePermissionDto) {
    return this.db.permission.create({ data });
  }

  @HandleExceptions()
  async update(id: number, data: UpdatePermissionDto) {
    return this.db.permission.update({ where: { id }, data });
  }

  @HandleExceptions()
  async delete(id: number) {
    return this.db.permission.delete({ where: { id } });
  }
}
