import { OmitType } from '@nestjs/swagger';

import { PermissionDto } from './permission.dto';

export class CreatePermissionDto extends OmitType(PermissionDto, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
