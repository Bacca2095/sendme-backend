import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RoleDto } from '../dto/role.dto';
import { RoleService } from '../providers/role.service';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOkResponse({ type: RoleDto, isArray: true })
  async get(): Promise<RoleDto[]> {
    return this.roleService.get();
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<RoleDto> {
    return this.roleService.getById(id);
  }

  @Post()
  async create(data: RoleDto): Promise<RoleDto> {
    return this.roleService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: number, data: RoleDto): Promise<RoleDto> {
    return this.roleService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<RoleDto> {
    return this.roleService.delete(id);
  }
}
