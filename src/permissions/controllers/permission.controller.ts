import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionService } from '../providers/permission.service';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async get() {
    return this.permissionService.get();
  }

  @Get(':id')
  async getById(id: number) {
    return this.permissionService.getById(id);
  }

  @Post()
  async create(data: CreatePermissionDto) {
    return this.permissionService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: number, data: UpdatePermissionDto) {
    return this.permissionService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.permissionService.delete(id);
  }
}
