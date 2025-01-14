import { OmitType } from '@nestjs/swagger';

import { RoleDto } from './role.dto';

export class CreateRoleDto extends OmitType(RoleDto, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
