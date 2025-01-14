import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { UserWithPasswordDto } from './user.dto';

export class CreateUserDto extends OmitType(UserWithPasswordDto, [
  'createdAt',
  'deletedAt',
  'updatedAt',
  'id',
  'role',
]) {
  @ApiProperty()
  @IsNumber()
  roleId: number;
}
